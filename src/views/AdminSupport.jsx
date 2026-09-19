'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import supabase from '../lib/supabase';



const formatTime = (value) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));


const ChatIcon = () => (
  <svg
    className="admin-support-chat-icon"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z"
    />
  </svg>
);


const SearchIcon = () => (
  <svg
    className="admin-support-search-icon"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle
      cx="11"
      cy="11"
      r="7"
      strokeWidth="1.8"
    />

    <path
      d="m20 20-4-4"
      strokeWidth="1.8"
    />
  </svg>
);


export default function AdminSupport() {
  const bottomRef = useRef(null);

  const [user, setUser] = useState(null);

  const [tickets, setTickets] = useState([]);

  const [activeTicket, setActiveTicket] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [text, setText] = useState('');

  const [search, setSearch] = useState('');

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [notice, setNotice] =
    useState('');


  const active = useMemo(
    () =>
      tickets.find(
        (ticket) =>
          ticket.id === activeTicket
      ),
    [tickets, activeTicket]
  );


  const visibleTickets = useMemo(() => {
    const query =
      search.trim().toLowerCase();


    return query
      ? tickets.filter((ticket) =>
          `${ticket.subject} ${ticket.buyer_email} ${ticket.status}`
            .toLowerCase()
            .includes(query)
        )
      : tickets;
  }, [search, tickets]);


  useEffect(() => {
    let channel;


    const init = async () => {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();


      const currentUser =
        session?.user;


      if (!currentUser) {
        setNotice(
          'Admin support access is not authorized for this account.'
        );

        setLoading(false);

        return;
      }


      const {
        data: isAdmin,
        error: roleError,
      } =
        await supabase.rpc('is_admin');


      if (roleError || !isAdmin) {
        setNotice(
          'Admin support access is not authorized for this account.'
        );

        setLoading(false);

        return;
      }


      setUser(currentUser);


      const data =
        await loadTickets();


      setActiveTicket(
        data?.[0]?.id || null
      );


      setLoading(false);


      channel = supabase
        .channel('admin-tickets')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'support_tickets',
          },
          loadTickets
        )
        .subscribe();
    };


    init();


    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);


  useEffect(() => {
    if (!activeTicket) {
      return undefined;
    }


    let channel;


    const load = async () => {
      const { data, error } =
        await supabase
          .from('support_messages')
          .select('*')
          .eq(
            'ticket_id',
            activeTicket
          )
          .order('created_at');


      if (error) {
        setNotice(
          'Could not load this conversation.'
        );
      } else {
        setMessages(data || []);
      }


      channel = supabase
        .channel(
          `admin-msg-${activeTicket}`
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter:
              `ticket_id=eq.${activeTicket}`,
          },
          (payload) => {
            setMessages((current) =>
              current.some(
                (message) =>
                  message.id ===
                  payload.new.id
              )
                ? current
                : [
                    ...current,
                    payload.new,
                  ]
            );


            loadTickets();
          }
        )
        .subscribe();
    };


    load();


    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeTicket]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);


  async function loadTickets() {
    const { data, error } =
      await supabase
        .from('support_tickets')
        .select('*')
        .order('last_message_at', {
          ascending: false,
        });


    if (error) {
      setNotice(
        'Could not load support tickets.'
      );

      return [];
    }


    setTickets(data || []);


    return data || [];
  }


  async function sendMessage(event) {
    event.preventDefault();


    if (
      !text.trim() ||
      !activeTicket ||
      !user
    ) {
      return;
    }


    const body = text.trim();


    setText('');

    setSending(true);


    const { error } =
      await supabase
        .from('support_messages')
        .insert({
          ticket_id: activeTicket,
          sender_id: user.id,
          sender_role: 'agent',
          body,
        });


    if (error) {
      setText(body);

      setNotice(error.message);
    }


    setSending(false);
  }


  async function updateStatus(status) {
    if (!activeTicket) {
      return;
    }


    const { error } =
      await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', activeTicket);


    if (error) {
      setNotice(error.message);
    } else {
      await loadTickets();
    }
  }


  if (loading) {
    return (
      <div className="admin-support-loading" />
    );
  }


  return (
    <section className="admin-support">


      {/* =====================================
          TICKET SIDEBAR
      ===================================== */}

      <aside className="admin-support-sidebar">


        <div>

          <h2 className="admin-support-sidebar-title">
            Support inbox
          </h2>


          <p className="admin-support-sidebar-subtitle">
            {
              tickets.filter(
                (ticket) =>
                  ticket.status === 'open'
              ).length
            }{' '}
            open conversations
          </p>

        </div>


        <label className="admin-support-search">

          <SearchIcon />


          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search conversations"
            className="admin-support-search-input"
          />

        </label>


        <div className="admin-support-ticket-list">

          {visibleTickets.map(
            (ticket) => (

              <button
                key={ticket.id}
                type="button"
                onClick={() =>
                  setActiveTicket(
                    ticket.id
                  )
                }
                className={
                  activeTicket ===
                  ticket.id
                    ? 'admin-support-ticket active'
                    : 'admin-support-ticket'
                }
              >

                <div className="admin-support-ticket-top">

                  <span className="admin-support-ticket-subject">
                    {ticket.subject}
                  </span>


                  <span
                    className={
                      ticket.status ===
                      'open'
                        ? 'admin-support-status admin-support-status-open'
                        : 'admin-support-status admin-support-status-resolved'
                    }
                  >
                    {ticket.status}
                  </span>

                </div>


                <p className="admin-support-ticket-email">
                  {ticket.buyer_email}
                </p>


                <p className="admin-support-ticket-time">
                  {formatTime(
                    ticket.last_message_at
                  )}
                </p>

              </button>

            )
          )}


          {visibleTickets.length ===
            0 && (

            <p className="admin-support-no-tickets">
              No conversations found.
            </p>

          )}

        </div>

      </aside>


      {/* =====================================
          CONVERSATION
      ===================================== */}

      <div className="admin-support-conversation">


        {notice && (

          <div className="admin-support-notice">
            {notice}
          </div>

        )}


        {active ? (
          <>


            {/* CHAT HEADER */}

            <header className="admin-support-chat-header">

              <div className="admin-support-chat-info">

                <h2 className="admin-support-chat-title">
                  {active.subject}
                </h2>


                <p className="admin-support-chat-meta">

                  {active.buyer_email}

                  {active.order_id
                    ? ` · Order #${active.order_id
                        .slice(0, 8)
                        .toUpperCase()}`
                    : ''}

                </p>

              </div>


              <div className="admin-support-header-actions">

                {active.status ===
                'open' ? (

                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        'resolved'
                      )
                    }
                    className="admin-support-resolve"
                  >
                    Resolve
                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      updateStatus('open')
                    }
                    className="admin-support-reopen"
                  >
                    Reopen
                  </button>

                )}

              </div>

            </header>


            {/* MESSAGES */}

            <div className="admin-support-messages">


              {messages.length === 0 && (

                <div className="admin-support-empty-chat">

                  <span className="admin-support-empty-icon">
                    <ChatIcon />
                  </span>


                  <h3 className="admin-support-empty-title">
                    No messages yet
                  </h3>


                  <p className="admin-support-empty-text">
                    The conversation is
                    ready for a reply.
                  </p>

                </div>

              )}


              {messages.map((message) => (

                <div
                  key={message.id}
                  className={
                    message.sender_role ===
                    'agent'
                      ? 'admin-support-message admin-support-message-agent'
                      : 'admin-support-message admin-support-message-buyer'
                  }
                >

                  <div
                    className={
                      message.sender_role ===
                      'agent'
                        ? 'admin-support-bubble admin-support-bubble-agent'
                        : 'admin-support-bubble admin-support-bubble-buyer'
                    }
                  >
                    {message.body}
                  </div>


                  <small className="admin-support-message-meta">

                    {message.sender_role ===
                    'agent'
                      ? 'You'
                      : active.buyer_email}

                    {' · '}

                    {formatTime(
                      message.created_at
                    )}

                  </small>

                </div>

              ))}


              <div ref={bottomRef} />

            </div>


            {/* MESSAGE COMPOSER */}

            <form
              onSubmit={sendMessage}
              className="admin-support-composer"
            >

              <input
                value={text}
                onChange={(event) =>
                  setText(
                    event.target.value
                  )
                }
                placeholder={
                  active.status === 'open'
                    ? 'Write a reply…'
                    : 'This conversation is resolved'
                }
                disabled={
                  active.status !== 'open'
                }
                maxLength="2000"
                className="admin-support-input"
              />


              <button
                disabled={
                  sending ||
                  active.status !== 'open'
                }
                className="admin-support-send"
              >

                {sending
                  ? 'Sending…'
                  : 'Send'}

              </button>

            </form>

          </>
        ) : (

          <div className="admin-support-no-active">

            <span className="admin-support-empty-icon admin-support-empty-icon-large">
              <ChatIcon />
            </span>


            <h2 className="admin-support-empty-title admin-support-empty-title-large">
              Support inbox is clear
            </h2>


            <p className="admin-support-empty-text">
              Select a conversation when a
              buyer needs help.
            </p>

          </div>

        )}

      </div>

    </section>
  );
}