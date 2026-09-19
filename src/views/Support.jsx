'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useNavigate,
} from '../lib/navigation';

import supabase from '../lib/supabase';



const formatTime = (
  value
) =>
  new Intl.DateTimeFormat(
    undefined,
    {
      hour: 'numeric',
      minute: '2-digit',
    }
  ).format(
    new Date(value)
  );


const ChatIcon = ({
  className = 'support-icon-24',
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h13v12Z"
    />
  </svg>
);


export default function Support() {
  const navigate =
    useNavigate();

  const bottomRef =
    useRef(null);


  const [
    user,
    setUser,
  ] = useState(null);

  const [
    accessToken,
    setAccessToken,
  ] = useState('');

  const [
    tickets,
    setTickets,
  ] = useState([]);

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    activeTicket,
    setActiveTicket,
  ] = useState(null);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    text,
    setText,
  ] = useState('');

  const [
    subject,
    setSubject,
  ] = useState('');

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    notice,
    setNotice,
  ] = useState('');


  const active =
    useMemo(
      () =>
        tickets.find(
          (ticket) =>
            ticket.id ===
            activeTicket
        ) || null,
      [
        tickets,
        activeTicket,
      ]
    );


  useEffect(() => {
    let channel;


    const boot =
      async () => {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();


        const currentUser =
          session?.user;


        if (!currentUser) {
          navigate('/login');

          return;
        }


        setUser(
          currentUser
        );


        setAccessToken(
          session.access_token
        );


        const [
          {
            data:
              ticketData,
          },
          {
            data:
              orderData,
          },
        ] =
          await Promise.all([
            supabase
              .from(
                'support_tickets'
              )
              .select('*')
              .eq(
                'buyer_id',
                currentUser.id
              )
              .order(
                'last_message_at',
                {
                  ascending:
                    false,
                }
              ),

            supabase
              .from(
                'orders'
              )
              .select(
                'id, amount, status, accounts(town_hall)'
              )
              .eq(
                'buyer_id',
                currentUser.id
              )
              .order(
                'created_at',
                {
                  ascending:
                    false,
                }
              ),
          ]);


        const nextTickets =
          ticketData || [];


        setTickets(
          nextTickets
        );


        setOrders(
          orderData || []
        );


        setActiveTicket(
          nextTickets[0]
            ?.id ||
            null
        );


        setLoading(false);


        channel =
          supabase
            .channel(
              `buyer-support-${currentUser.id}`
            )
            .on(
              'postgres_changes',
              {
                event: '*',
                schema:
                  'public',
                table:
                  'support_tickets',
                filter:
                  `buyer_id=eq.${currentUser.id}`,
              },
              () =>
                refreshTickets(
                  currentUser.id
                )
            )
            .subscribe();
      };


    boot();


    return () => {
      if (channel) {
        supabase.removeChannel(
          channel
        );
      }
    };
  }, [navigate]);


  useEffect(() => {
    if (!activeTicket) {
      return undefined;
    }


    let channel;


    const loadMessages =
      async () => {
        const {
          data,
        } =
          await supabase
            .from(
              'support_messages'
            )
            .select('*')
            .eq(
              'ticket_id',
              activeTicket
            )
            .order(
              'created_at'
            );


        setMessages(
          data || []
        );


        channel =
          supabase
            .channel(
              `support-messages-${activeTicket}`
            )
            .on(
              'postgres_changes',
              {
                event:
                  'INSERT',
                schema:
                  'public',
                table:
                  'support_messages',
                filter:
                  `ticket_id=eq.${activeTicket}`,
              },
              (payload) => {
                setMessages(
                  (
                    current
                  ) =>
                    current.some(
                      (
                        message
                      ) =>
                        message.id ===
                        payload.new
                          .id
                    )
                      ? current
                      : [
                          ...current,
                          payload.new,
                        ]
                );


                refreshTickets(
                  user?.id
                );
              }
            )
            .subscribe();
      };


    loadMessages();


    return () => {
      if (channel) {
        supabase.removeChannel(
          channel
        );
      }
    };
  }, [
    activeTicket,
    user?.id,
  ]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior:
        'smooth',
    });
  }, [messages]);


  async function refreshTickets(
    buyerId
  ) {
    if (!buyerId) {
      return;
    }


    const {
      data,
    } =
      await supabase
        .from(
          'support_tickets'
        )
        .select('*')
        .eq(
          'buyer_id',
          buyerId
        )
        .order(
          'last_message_at',
          {
            ascending:
              false,
          }
        );


    if (data) {
      setTickets(
        data
      );


      setActiveTicket(
        (current) =>
          current ||
          data[0]?.id ||
          null
      );
    }
  }


  async function createTicket(
    event
  ) {
    event.preventDefault();


    if (
      !subject.trim() ||
      !user
    ) {
      return;
    }


    setCreating(true);

    setNotice('');


    try {
      if (!accessToken) {
        throw new Error(
          'Your session has expired. Please sign in again.'
        );
      }


      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/support_tickets`,
          {
            method:
              'POST',

            headers: {
              apikey:
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

              Authorization:
                `Bearer ${accessToken}`,

              'Content-Type':
                'application/json',

              Prefer:
                'return=minimal',
            },

            body:
              JSON.stringify({
                buyer_id:
                  user.id,

                buyer_email:
                  user.email,

                subject:
                  subject.trim(),

                order_id:
                  selectedOrder ||
                  null,
              }),

            signal:
              AbortSignal.timeout(
                15000
              ),
          }
        );


      if (!response.ok) {
        throw new Error(
          (
            await response.text()
          ) ||
            'Unable to create this conversation.'
        );
      }


      await refreshTickets(
        user.id
      );


      setSubject('');

      setSelectedOrder('');

      setShowModal(false);
    } catch (error) {
      setNotice(
        error.name ===
          'TimeoutError'
          ? 'Support is taking too long to respond. Please try again.'
          : error.message
      );
    } finally {
      setCreating(false);
    }
  }


  async function sendMessage(
    event
  ) {
    event.preventDefault();


    if (
      !text.trim() ||
      !activeTicket ||
      !user
    ) {
      return;
    }


    setSending(true);

    setNotice('');


    const body =
      text.trim();


    setText('');


    const {
      error,
    } =
      await supabase
        .from(
          'support_messages'
        )
        .insert({
          ticket_id:
            activeTicket,

          sender_id:
            user.id,

          sender_role:
            'buyer',

          body,
        });


    if (error) {
      setText(
        body
      );

      setNotice(
        error.message
      );
    }


    setSending(false);
  }


  return (
    <main className="support-page">

      <div className="support-page-shell">


        {/* HEADER */}

        <header className="support-header">

          <div>

            <p className="support-brand-kicker">
              AllGamersMarket care
            </p>


            <a
              href="mailto:support@allgamersmarket.com"
              className="support-email-link"
            >
              support@allgamersmarket.com
            </a>

          </div>


          <div className="support-online-badge">

            <span className="support-online-dot" />

            Support team online

          </div>

        </header>


        {/* NOTICE */}

        {notice && (

          <div className="support-notice">
            {notice}
          </div>

        )}


        {/* WORKSPACE */}

        {loading ? (

          <div className="support-loading" />

        ) : (

          <div className="support-workspace">


            {/* SIDEBAR */}

            <aside className="support-sidebar">

              <button
                type="button"
                onClick={() =>
                  setShowModal(
                    true
                  )
                }
                className="support-new-ticket-button"
              >

                <span className="support-new-ticket-plus">
                  +
                </span>

                Start a conversation

              </button>


              <div className="support-conversation-heading">

                <p className="support-conversation-title">
                  Your conversations
                </p>


                <span className="support-ticket-count">
                  {tickets.length}
                </span>

              </div>


              <div className="support-ticket-list">

                {tickets.length ? (

                  tickets.map(
                    (
                      ticket
                    ) => {

                      const selected =
                        activeTicket ===
                        ticket.id;


                      return (
                        <button
                          key={
                            ticket.id
                          }
                          type="button"
                          onClick={() =>
                            setActiveTicket(
                              ticket.id
                            )
                          }
                          className={
                            selected
                              ? 'support-ticket-button support-ticket-button-active'
                              : 'support-ticket-button'
                          }
                        >

                          <span className="support-ticket-subject">
                            {ticket.subject}
                          </span>


                          <span className="support-ticket-meta">

                            <span
                              className={
                                ticket.status ===
                                'open'
                                  ? 'support-ticket-status support-ticket-status-open'
                                  : 'support-ticket-status support-ticket-status-closed'
                              }
                            >
                              {ticket.status}
                            </span>


                            <span>
                              {formatTime(
                                ticket.last_message_at
                              )}
                            </span>

                          </span>

                        </button>
                      );
                    }
                  )

                ) : (

                  <p className="support-no-tickets">
                    No conversations yet.
                  </p>

                )}

              </div>

            </aside>


            {/* CHAT */}

            <section className="support-chat">

              {active ? (
                <>


                  {/* CHAT HEADER */}

                  <div className="support-chat-header">

                    <div className="support-chat-header-info">

                      <h2 className="support-chat-title">
                        {active.subject}
                      </h2>


                      <p className="support-chat-subtitle">

                        {active.status ===
                        'open'
                          ? 'Our team will reply here.'
                          : 'This conversation is resolved.'}

                      </p>

                    </div>


                    <span
                      className={
                        active.status ===
                        'open'
                          ? 'support-status-badge support-status-open'
                          : 'support-status-badge support-status-resolved'
                      }
                    >
                      {active.status}
                    </span>

                  </div>


                  {/* MESSAGES */}

                  <div className="support-chat-canvas">

                    {messages.length ===
                      0 && (

                      <div className="support-empty-chat">

                        <span className="support-empty-chat-icon">

                          <ChatIcon className="support-icon-20" />

                        </span>


                        <h3 className="support-empty-chat-title">
                          How can we help?
                        </h3>


                        <p className="support-empty-chat-text">
                          Send a message and
                          our support team
                          will respond here.
                        </p>

                      </div>

                    )}


                    {messages.map(
                      (
                        message
                      ) => {

                        const fromBuyer =
                          message.sender_role ===
                          'buyer';


                        return (
                          <div
                            key={
                              message.id
                            }
                            className={
                              fromBuyer
                                ? 'support-message-row support-message-row-buyer'
                                : 'support-message-row support-message-row-agent'
                            }
                          >

                            <div
                              className={
                                fromBuyer
                                  ? 'support-message support-message-buyer'
                                  : 'support-message support-message-agent'
                              }
                            >
                              {message.body}
                            </div>


                            <small className="support-message-meta">

                              {fromBuyer
                                ? 'You'
                                : 'AllGamersMarket Support'}

                              {' · '}

                              {formatTime(
                                message.created_at
                              )}

                            </small>

                          </div>
                        );
                      }
                    )}


                    <div
                      ref={
                        bottomRef
                      }
                    />

                  </div>


                  {/* COMPOSER */}

                  <form
                    onSubmit={
                      sendMessage
                    }
                    className="support-chat-composer"
                  >

                    <input
                      value={
                        text
                      }
                      onChange={(
                        event
                      ) =>
                        setText(
                          event.target.value
                        )
                      }
                      placeholder={
                        active.status ===
                        'open'
                          ? 'Write a message…'
                          : 'This conversation is resolved'
                      }
                      maxLength="2000"
                      disabled={
                        active.status !==
                        'open'
                      }
                      className="support-message-input"
                    />


                    <button
                      type="submit"
                      disabled={
                        sending ||
                        active.status !==
                          'open'
                      }
                      className="support-send-button"
                    >
                      {sending
                        ? 'Sending…'
                        : 'Send'}
                    </button>

                  </form>

                </>

              ) : (

                <div className="support-no-active">

                  <span className="support-no-active-icon">

                    <ChatIcon className="support-icon-20" />

                  </span>


                  <h2 className="support-no-active-title">
                    Need help?
                  </h2>


                  <p className="support-no-active-text">
                    Start a conversation
                    about an order or
                    account.
                  </p>


                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(
                        true
                      )
                    }
                    className="support-no-active-button"
                  >
                    Start a conversation
                  </button>

                </div>

              )}

            </section>

          </div>

        )}

      </div>


      {/* NEW CONVERSATION MODAL */}

      {showModal && (

        <div
          className="support-modal-overlay"
          onMouseDown={() =>
            setShowModal(
              false
            )
          }
        >

          <form
            onSubmit={
              createTicket
            }
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
            className="support-modal"
          >

            <button
              type="button"
              onClick={() =>
                setShowModal(
                  false
                )
              }
              aria-label="Close"
              className="support-modal-close"
            >
              ×
            </button>


            <p className="support-modal-kicker">
              New conversation
            </p>


            <h2 className="support-modal-title">
              Tell us what you need
            </h2>


            <p className="support-modal-description">
              Your message and purchase
              details stay private.
            </p>


            <label className="support-modal-field">

              Subject

              <input
                value={
                  subject
                }
                onChange={(
                  event
                ) =>
                  setSubject(
                    event.target.value
                  )
                }
                placeholder="Example: Help with my delivery"
                maxLength="120"
                autoFocus
                className="support-modal-input"
              />

            </label>


            <label className="support-modal-field">

              Related order

              <select
                value={
                  selectedOrder
                }
                onChange={(
                  event
                ) =>
                  setSelectedOrder(
                    event.target.value
                  )
                }
                className="support-modal-select"
              >

                <option value="">
                  General question
                </option>


                {orders.map(
                  (
                    order
                  ) => (

                    <option
                      value={
                        order.id
                      }
                      key={
                        order.id
                      }
                    >
                      TH
                      {order.accounts
                        ?.town_hall ||
                        '?'}
                      {' · ₹'}
                      {order.amount}
                      {' · #'}
                      {order.id.slice(
                        0,
                        8
                      )}
                    </option>

                  )
                )}

              </select>

            </label>


            <button
              type="submit"
              disabled={
                creating
              }
              className="support-modal-submit"
            >
              {creating
                ? 'Creating…'
                : 'Create conversation'}
            </button>

          </form>

        </div>

      )}

    </main>
  );
}
