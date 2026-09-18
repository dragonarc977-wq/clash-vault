import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import supabase from '../lib/supabase';

import '../styles/notifications.css';


const BellIcon = () => (
  <svg
    className="notifications-icon-large"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      d="M18.5 14V10a6.5 6.5 0 0 0-13 0v4L3.8 16h16.4L18.5 14ZM10 20h4"
    />
  </svg>
);


const OrderIcon = () => (
  <svg
    className="notification-icon"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7m-8 4v10"
    />
  </svg>
);


const ChatIcon = () => (
  <svg
    className="notification-icon"
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


const ArrowIcon = () => (
  <svg
    className="notification-icon"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="m9 18 6-6-6-6"
    />
  </svg>
);


const formatDate = (value) =>
  new Intl.DateTimeFormat(
    undefined,
    {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }
  ).format(new Date(value));


export default function Notifications() {
  const navigate = useNavigate();

  const [
    activity,
    setActivity,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    readAt,
    setReadAt,
  ] = useState(
    () =>
      localStorage.getItem(
        'clashvault_notifications_read_at'
      ) || ''
  );


  useEffect(() => {
    let active = true;


    const loadActivity =
      async () => {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();


        if (!active) {
          return;
        }


        if (!user) {
          navigate('/login');

          return;
        }


        const [
          {
            data: orders,
            error: ordersError,
          },
          {
            data: tickets,
            error: ticketsError,
          },
        ] = await Promise.all([
          supabase
            .from('orders')
            .select(
              'id, status, amount, created_at'
            )
            .eq(
              'buyer_id',
              user.id
            )
            .order(
              'created_at',
              {
                ascending: false,
              }
            )
            .limit(20),

          supabase
            .from(
              'support_tickets'
            )
            .select(
              'id, subject, status, created_at, last_message_at'
            )
            .eq(
              'buyer_id',
              user.id
            )
            .order(
              'last_message_at',
              {
                ascending: false,
              }
            )
            .limit(20),
        ]);


        if (!active) {
          return;
        }


        if (
          ordersError ||
          ticketsError
        ) {
          setError(
            'We could not load your notifications. Please try again.'
          );

          setLoading(false);

          return;
        }


        const orderActivity =
          (orders || []).map(
            (order) => ({
              id:
                `order-${order.id}`,

              type:
                'order',

              title:
                order.status ===
                  'delivered' ||
                order.status ===
                  'completed'
                  ? 'Your order was delivered'
                  : 'Order update',

              description:
                `Order #${String(
                  order.id
                )
                  .slice(0, 8)
                  .toUpperCase()} is ${
                  order.status ||
                  'pending'
                }${
                  order.amount
                    ? ` · ₹${Number(
                        order.amount
                      ).toLocaleString(
                        'en-IN'
                      )}`
                    : ''
                }.`,

              time:
                order.created_at,

              path:
                '/my-orders',
            })
          );


        const ticketActivity =
          (tickets || []).map(
            (ticket) => ({
              id:
                `ticket-${ticket.id}`,

              type:
                'support',

              title:
                'Support conversation updated',

              description:
                `${ticket.subject} · ${
                  ticket.status ||
                  'open'
                }`,

              time:
                ticket.last_message_at ||
                ticket.created_at,

              path:
                '/support',
            })
          );


        setActivity(
          [
            ...orderActivity,
            ...ticketActivity,
          ].sort(
            (a, b) =>
              new Date(b.time) -
              new Date(a.time)
          )
        );


        setLoading(false);
      };


    loadActivity();


    return () => {
      active = false;
    };
  }, [navigate]);


  const unreadCount =
    useMemo(
      () =>
        activity.filter(
          (item) =>
            !readAt ||
            new Date(
              item.time
            ) >
              new Date(
                readAt
              )
        ).length,
      [
        activity,
        readAt,
      ]
    );


  const markAllRead = () => {
    const now =
      new Date().toISOString();


    localStorage.setItem(
      'clashvault_notifications_read_at',
      now
    );


    setReadAt(now);
  };


  return (
    <main className="notifications-page">

      <div className="notifications-container">


        {/* HEADER */}

        <div className="notifications-header">

          <div>

            <p className="notifications-kicker">
              Buyer account
            </p>


            <h1 className="notifications-title">
              Notifications
            </h1>


            <p className="notifications-subtitle">
              Order and support updates,
              all in one place.
            </p>

          </div>


          {unreadCount > 0 && (

            <button
              type="button"
              onClick={
                markAllRead
              }
              className="notifications-read-button"
            >
              Mark all as read
            </button>

          )}

        </div>


        {/* ACTIVITY */}

        <section className="notifications-panel">

          <div className="notifications-panel-header">

            <div className="notifications-panel-heading">

              <span className="notifications-panel-icon">
                <BellIcon />
              </span>


              <div>

                <h2 className="notifications-panel-title">
                  Recent activity
                </h2>


                <p className="notifications-panel-status">

                  {unreadCount
                    ? `${unreadCount} unread`
                    : 'You are all caught up'}

                </p>

              </div>

            </div>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="notifications-loading">

              {[1, 2, 3].map(
                (item) => (

                  <div
                    key={item}
                    className="notifications-loading-item"
                  />

                )
              )}

            </div>

          ) : error ? (

            <div className="notifications-error">
              {error}
            </div>

          ) : activity.length ===
            0 ? (

            <div className="notifications-empty">

              <span className="notifications-empty-icon">
                <BellIcon />
              </span>


              <h2 className="notifications-empty-title">
                No notifications yet
              </h2>


              <p className="notifications-empty-text">
                Updates about orders and
                support conversations
                will appear here.
              </p>


              <Link
                to="/#games"
                className="notifications-explore-link"
              >
                Explore games
              </Link>

            </div>

          ) : (

            <div className="notifications-list">

              {activity.map(
                (item) => {
                  const unread =
                    !readAt ||
                    new Date(
                      item.time
                    ) >
                      new Date(
                        readAt
                      );


                  return (
                    <Link
                      key={
                        item.id
                      }
                      to={
                        item.path
                      }
                      className="notification-item"
                    >

                      <span
                        className={
                          item.type ===
                          'order'
                            ? 'notification-item-icon notification-item-icon-order'
                            : 'notification-item-icon notification-item-icon-support'
                        }
                      >

                        {item.type ===
                        'order'
                          ? (
                              <OrderIcon />
                            )
                          : (
                              <ChatIcon />
                            )}

                      </span>


                      <div className="notification-item-body">

                        <div className="notification-item-title-row">

                          <h3 className="notification-item-title">
                            {item.title}
                          </h3>


                          {unread && (

                            <span className="notification-unread-dot" />

                          )}

                        </div>


                        <p className="notification-item-description">
                          {item.description}
                        </p>


                        <p className="notification-item-time">
                          {formatDate(
                            item.time
                          )}
                        </p>

                      </div>


                      <span className="notification-item-arrow">
                        <ArrowIcon />
                      </span>

                    </Link>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}