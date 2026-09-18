import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import supabase from '../lib/supabase';

import '../styles/seller-messages.css';


const time = (value) =>
  value
    ? new Intl.DateTimeFormat(
        undefined,
        {
          hour: 'numeric',
          minute: '2-digit',
        }
      ).format(new Date(value))
    : '';


const ChatIcon = () => (
  <svg
    className="seller-chat-icon"
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


export default function SellerMessages() {
  const { listingId } =
    useParams();

  const navigate =
    useNavigate();

  const bottomRef =
    useRef(null);

  const [user, setUser] =
    useState(null);

  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [
    sellerNames,
    setSellerNames,
  ] = useState({});

  const [activeId, setActiveId] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [notice, setNotice] =
    useState('');


  const active = useMemo(
    () =>
      conversations.find(
        (item) =>
          item.id === activeId
      ) || null,
    [
      activeId,
      conversations,
    ]
  );


  const loadConversations =
    useCallback(
      async (
        currentUser,
        preferredId = null
      ) => {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              'seller_conversations'
            )
            .select(
              '*, accounts(title,game_id,thumbnail_url,image_url,status)'
            )
            .or(
              `buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`
            )
            .order(
              'last_message_at',
              {
                ascending: false,
              }
            );


        if (error) {
          setNotice(
            error.message
          );

          setLoading(false);

          return;
        }


        const rows =
          data || [];


        setConversations(
          rows
        );


        const sellerIds = [
          ...new Set(
            rows
              .map(
                (item) =>
                  item.seller_id
              )
              .filter(Boolean)
          ),
        ];


        if (sellerIds.length) {
          const {
            data: sellers,
          } =
            await supabase
              .from(
                'public_sellers'
              )
              .select(
                'user_id,display_name,avatar_url'
              )
              .in(
                'user_id',
                sellerIds
              );


          setSellerNames(
            Object.fromEntries(
              (
                sellers || []
              ).map(
                (seller) => [
                  seller.user_id,
                  seller,
                ]
              )
            )
          );
        }


        setActiveId(
          (current) =>
            preferredId ||
            current ||
            rows[0]?.id ||
            null
        );


        setLoading(false);
      },
      []
    );


  useEffect(() => {
    let activePage = true;


    (async () => {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();


      if (!session?.user) {
        navigate(
          '/login',
          {
            replace: true,
          }
        );

        return;
      }


      if (!activePage) {
        return;
      }


      setUser(
        session.user
      );


      let preferredId = null;


      if (listingId) {
        const {
          data,
          error,
        } =
          await supabase.rpc(
            'open_seller_conversation',
            {
              p_listing_id:
                listingId,
            }
          );


        if (error) {
          setNotice(
            error.message
          );
        } else {
          preferredId =
            data;
        }
      }


      await loadConversations(
        session.user,
        preferredId
      );
    })();


    return () => {
      activePage = false;
    };
  }, [
    listingId,
    loadConversations,
    navigate,
  ]);


  useEffect(() => {
    if (!activeId) {
      return undefined;
    }


    let channel;


    supabase
      .from(
        'seller_messages'
      )
      .select('*')
      .eq(
        'conversation_id',
        activeId
      )
      .order('created_at')
      .then(({ data }) => {
        setMessages(
          data || []
        );


        channel = supabase
          .channel(
            `seller-chat-${activeId}`
          )
          .on(
            'postgres_changes',
            {
              event:
                'INSERT',
              schema:
                'public',
              table:
                'seller_messages',
              filter:
                `conversation_id=eq.${activeId}`,
            },
            (payload) =>
              setMessages(
                (current) =>
                  current.some(
                    (item) =>
                      item.id ===
                      payload.new.id
                  )
                    ? current
                    : [
                        ...current,
                        payload.new,
                      ]
              )
          )
          .subscribe();
      });


    return () => {
      if (channel) {
        supabase.removeChannel(
          channel
        );
      }
    };
  }, [activeId]);


  useEffect(() => {
    bottomRef.current
      ?.scrollIntoView({
        behavior:
          'smooth',
      });
  }, [messages]);


  async function send(event) {
    event.preventDefault();


    if (
      !message.trim() ||
      !active ||
      !user
    ) {
      return;
    }


    setSending(true);

    setNotice('');


    const body =
      message.trim();


    const senderRole =
      active.seller_id ===
      user.id
        ? 'seller'
        : 'buyer';


    const { error } =
      await supabase
        .from(
          'seller_messages'
        )
        .insert({
          conversation_id:
            active.id,

          sender_id:
            user.id,

          sender_role:
            senderRole,

          body,
        });


    if (error) {
      setNotice(
        error.message
      );
    } else {
      setMessage('');


      await loadConversations(
        user,
        active.id
      );
    }


    setSending(false);
  }


  const conversationName = (
    conversation
  ) =>
    conversation.seller_id ===
    user?.id
      ? `Buyer ${conversation.buyer_id
          .slice(0, 6)
          .toUpperCase()}`
      : sellerNames[
          conversation.seller_id
        ]?.display_name ||
        'Verified seller';


  return (
    <main className="seller-messages-page">

      <div className="seller-messages-container">


        {/* PAGE HEADER */}

        <header>

          <p className="seller-messages-kicker">
            Private marketplace messages
          </p>


          <h1 className="seller-messages-title">
            Seller chat
          </h1>


          <p className="seller-messages-description">
            Ask about a listing and keep
            all product communication in
            one place.
          </p>

        </header>


        {notice && (

          <div className="seller-messages-notice">
            {notice}
          </div>

        )}


        {loading ? (

          <div className="seller-messages-loading" />

        ) : (

          <div className="seller-messages-shell">


            {/* CONVERSATIONS */}

            <aside className="seller-messages-sidebar">

              <p className="seller-messages-sidebar-title">
                Conversations
              </p>


              <div className="seller-conversation-list">

                {conversations.map(
                  (
                    conversation
                  ) => (

                    <button
                      key={
                        conversation.id
                      }
                      type="button"
                      onClick={() =>
                        setActiveId(
                          conversation.id
                        )
                      }
                      className={
                        activeId ===
                        conversation.id
                          ? 'seller-conversation-button active'
                          : 'seller-conversation-button'
                      }
                    >

                      <div className="seller-conversation-content">

                        <img
                          src={
                            conversation
                              .accounts
                              ?.thumbnail_url ||
                            conversation
                              .accounts
                              ?.image_url
                          }
                          alt=""
                          className="seller-conversation-image"
                        />


                        <div className="seller-conversation-copy">

                          <p className="seller-conversation-name">
                            {conversationName(
                              conversation
                            )}
                          </p>


                          <p className="seller-conversation-listing">

                            {conversation
                              .accounts
                              ?.title ||
                              'Marketplace listing'}

                          </p>

                        </div>

                      </div>

                    </button>

                  )
                )}


                {!conversations.length && (

                  <p className="seller-conversation-empty">
                    No seller conversations
                    yet.
                  </p>

                )}

              </div>

            </aside>


            {/* CHAT */}

            <section className="seller-chat-section">

              {active ? (
                <>

                  <div className="seller-chat-header">

                    <div>

                      <h2 className="seller-chat-person">
                        {conversationName(
                          active
                        )}
                      </h2>


                      <Link
                        to={`/account/${active.listing_id}`}
                        className="seller-chat-listing-link"
                      >

                        {active.accounts
                          ?.title ||
                          'View listing'}{' '}
                        →

                      </Link>

                    </div>


                    <span className="seller-chat-private">
                      Private
                    </span>

                  </div>


                  {/* MESSAGE STREAM */}

                  <div className="seller-chat-messages">

                    {messages.length ? (

                      messages.map(
                        (item) => {
                          const mine =
                            item.sender_id ===
                            user?.id;


                          return (
                            <div
                              key={
                                item.id
                              }
                              className={
                                mine
                                  ? 'seller-chat-message seller-chat-message-mine'
                                  : 'seller-chat-message seller-chat-message-other'
                              }
                            >

                              <div
                                className={
                                  mine
                                    ? 'seller-chat-bubble seller-chat-bubble-mine'
                                    : 'seller-chat-bubble seller-chat-bubble-other'
                                }
                              >
                                {item.body}
                              </div>


                              <span className="seller-chat-message-meta">

                                {mine
                                  ? 'You'
                                  : item.sender_role ===
                                      'seller'
                                    ? 'Seller'
                                    : 'Buyer'}

                                {' · '}

                                {time(
                                  item.created_at
                                )}

                              </span>

                            </div>
                          );
                        }
                      )

                    ) : (

                      <div className="seller-chat-empty">

                        <span className="seller-chat-empty-icon">
                          <ChatIcon />
                        </span>


                        <h3 className="seller-chat-empty-title">
                          Start the conversation
                        </h3>


                        <p className="seller-chat-empty-text">
                          Do not share passwords
                          or payment information
                          in chat.
                        </p>

                      </div>

                    )}


                    <div ref={bottomRef} />

                  </div>


                  {/* MESSAGE COMPOSER */}

                  <form
                    onSubmit={send}
                    className="seller-chat-composer"
                  >

                    <input
                      value={message}
                      onChange={(
                        event
                      ) =>
                        setMessage(
                          event.target
                            .value
                        )
                      }
                      maxLength="2000"
                      placeholder="Write a message…"
                      className="seller-chat-input"
                    />


                    <button
                      disabled={
                        sending ||
                        !message.trim()
                      }
                      className="seller-chat-send"
                    >
                      {sending
                        ? 'Sending…'
                        : 'Send'}
                    </button>

                  </form>

                </>

              ) : (

                <div className="seller-chat-no-active">

                  <ChatIcon />


                  <h2 className="seller-chat-no-active-title">
                    Select a conversation
                  </h2>

                </div>

              )}

            </section>

          </div>

        )}

      </div>

    </main>
  );
}