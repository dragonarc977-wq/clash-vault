'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Navigate,
} from '../lib/navigation';

import supabase from '../lib/supabase';



const when = (
  value
) =>
  new Intl.DateTimeFormat(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
  ).format(
    new Date(value)
  );


export default function SupportInbox() {
  const endRef =
    useRef(null);


  const [
    agent,
    setAgent,
  ] = useState(null);

  const [
    allowed,
    setAllowed,
  ] = useState(null);

  const [
    tickets,
    setTickets,
  ] = useState([]);

  const [
    activeId,
    setActiveId,
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
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');


  const active =
    tickets.find(
      (ticket) =>
        ticket.id ===
        activeId
    );


  useEffect(() => {
    let mounted = true;


    const initialize =
      async () => {
        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();


        if (!mounted) {
          return;
        }


        if (!user) {
          setAllowed(false);

          setLoading(false);

          return;
        }


        const {
          data: access,
          error:
            roleError,
        } =
          await supabase.rpc(
            'is_support_agent'
          );


        if (!mounted) {
          return;
        }


        setAgent(user);

        setAllowed(
          !roleError &&
          Boolean(access)
        );


        if (
          !roleError &&
          access
        ) {
          const {
            data,
            error:
              queryError,
          } =
            await supabase
              .from(
                'support_tickets'
              )
              .select('*')
              .order(
                'last_message_at',
                {
                  ascending:
                    false,
                }
              );


          if (!mounted) {
            return;
          }


          if (queryError) {
            setError(
              queryError.message
            );
          } else {
            setTickets(
              data || []
            );

            setActiveId(
              data?.[0]?.id ||
              null
            );
          }
        }


        setLoading(false);
      };


    initialize();


    return () => {
      mounted = false;
    };
  }, []);


  useEffect(() => {
    if (activeId) {
      loadMessages(
        activeId
      );
    }
  }, [activeId]);


  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior:
        'smooth',
    });
  }, [messages]);


  async function loadTickets() {
    const {
      data,
      error:
        queryError,
    } =
      await supabase
        .from(
          'support_tickets'
        )
        .select('*')
        .order(
          'last_message_at',
          {
            ascending:
              false,
          }
        );


    if (queryError) {
      setError(
        queryError.message
      );
    } else {
      setTickets(
        data || []
      );


      setActiveId(
        (id) =>
          id ||
          data?.[0]?.id ||
          null
      );
    }
  }


  async function loadMessages(
    ticketId
  ) {
    const {
      data,
      error:
        queryError,
    } =
      await supabase
        .from(
          'support_messages'
        )
        .select('*')
        .eq(
          'ticket_id',
          ticketId
        )
        .order(
          'created_at'
        );


    if (queryError) {
      setError(
        queryError.message
      );
    } else {
      setMessages(
        data || []
      );
    }
  }


  async function send(
    event
  ) {
    event.preventDefault();


    if (
      !text.trim() ||
      !activeId
    ) {
      return;
    }


    const body =
      text.trim();


    setText('');


    const {
      error:
        insertError,
    } =
      await supabase
        .from(
          'support_messages'
        )
        .insert({
          ticket_id:
            activeId,

          sender_id:
            agent.id,

          sender_role:
            'agent',

          body,
        });


    if (insertError) {
      setText(
        body
      );

      setError(
        insertError.message
      );
    } else {
      await loadMessages(
        activeId
      );

      await loadTickets();
    }
  }


  async function toggleStatus() {
    if (!active) {
      return;
    }


    const next =
      active.status ===
      'open'
        ? 'resolved'
        : 'open';


    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          'support_tickets'
        )
        .update({
          status:
            next,
        })
        .eq(
          'id',
          active.id
        );


    if (updateError) {
      setError(
        updateError.message
      );
    } else {
      loadTickets();
    }
  }


  if (allowed === false) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return (
    <main className="support-inbox-page">


      {/* HEADER */}

      <header className="support-inbox-header">

        <div>

          <p className="support-inbox-kicker">
            ALLGAMERSMARKET · PRIVATE
          </p>


          <h1 className="support-inbox-title">
            Support inbox
          </h1>

        </div>


        <span className="support-inbox-access">
          ● Team access
        </span>

      </header>


      {/* CONTENT */}

      {loading ? (

        <div className="support-inbox-card">
          Checking access…
        </div>

      ) : (

        <div className="support-inbox-layout">


          {/* SIDEBAR */}

          <aside className="support-inbox-sidebar">

            <h2 className="support-inbox-sidebar-title">
              Conversations{' '}

              <small className="support-inbox-sidebar-count">
                {tickets.length}
              </small>
            </h2>


            {tickets.map(
              (
                ticket
              ) => (

                <button
                  type="button"
                  key={
                    ticket.id
                  }
                  onClick={() =>
                    setActiveId(
                      ticket.id
                    )
                  }
                  className={
                    ticket.id ===
                    activeId
                      ? 'support-inbox-ticket support-inbox-ticket-active'
                      : 'support-inbox-ticket'
                  }
                >

                  <strong className="support-inbox-ticket-subject">
                    {ticket.subject}
                  </strong>


                  <em className="support-inbox-ticket-email">
                    {ticket.buyer_email}
                  </em>


                  <small className="support-inbox-ticket-meta">
                    {ticket.status}
                    {' · '}
                    {when(
                      ticket.last_message_at
                    )}
                  </small>

                </button>

              )
            )}

          </aside>


          {/* THREAD */}

          <section className="support-inbox-thread-section">

            {active ? (
              <>


                {/* THREAD HEADER */}

                <div className="support-inbox-thread-header">

                  <div>

                    <h2 className="support-inbox-thread-title">
                      {active.subject}
                    </h2>


                    <p className="support-inbox-thread-meta">

                      {active.buyer_email}

                      {active.order_id
                        ? ` · Order #${active.order_id.slice(
                            0,
                            8
                          )}`
                        : ''}

                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={
                      toggleStatus
                    }
                    className="support-inbox-status-button"
                  >
                    {active.status ===
                    'open'
                      ? 'Resolve conversation'
                      : 'Reopen conversation'}
                  </button>

                </div>


                {/* MESSAGES */}

                <div className="support-inbox-thread">

                  {messages.map(
                    (
                      message
                    ) => {
                      const mine =
                        message.sender_role ===
                        'agent';


                      return (
                        <div
                          key={
                            message.id
                          }
                          className={
                            mine
                              ? 'support-inbox-message support-inbox-message-agent'
                              : 'support-inbox-message'
                          }
                        >

                          <div className="support-inbox-message-body">
                            {message.body}
                          </div>


                          <small className="support-inbox-message-meta">

                            {mine
                              ? 'You'
                              : active.buyer_email}

                            {' · '}

                            {when(
                              message.created_at
                            )}

                          </small>

                        </div>
                      );
                    }
                  )}


                  <div
                    ref={
                      endRef
                    }
                  />

                </div>


                {/* COMPOSER */}

                <form
                  onSubmit={
                    send
                  }
                  className="support-inbox-composer"
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
                    placeholder="Reply to buyer…"
                    disabled={
                      active.status !==
                      'open'
                    }
                    className="support-inbox-input"
                  />


                  <button
                    type="submit"
                    disabled={
                      active.status !==
                      'open'
                    }
                    className="support-inbox-send-button"
                  >
                    Send reply
                  </button>

                </form>

              </>

            ) : (

              <div className="support-inbox-empty">
                No support conversations yet.
              </div>

            )}

          </section>

        </div>

      )}


      {/* ERROR */}

      {error && (

        <div className="support-inbox-error">
          {error}
        </div>

      )}

    </main>
  );
}