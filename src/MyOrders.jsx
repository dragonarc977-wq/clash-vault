'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useSearchParams,
} from './lib/navigation';

import supabase from './lib/supabase';



const PackageIcon = () => (
  <svg
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


const ArrowIcon = () => (
  <svg
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


const statusStyle = {
  delivered:
    'my-order-status my-order-status-success',

  completed:
    'my-order-status my-order-status-success',

  paid:
    'my-order-status my-order-status-paid',

  pending:
    'my-order-status my-order-status-pending',

  disputed:
    'my-order-status my-order-status-danger',

  refunded:
    'my-order-status my-order-status-refunded',

  cancelled:
    'my-order-status my-order-status-danger',

  failed:
    'my-order-status my-order-status-danger',
};


const statusText = {
  paid:
    'Awaiting seller delivery',

  delivered:
    'Delivered — check details',

  completed:
    'Delivery confirmed',

  disputed:
    'Dispute under review',

  refunded:
    'Resolved for buyer',
};


const formatDate = (
  value
) =>
  value
    ? new Intl.DateTimeFormat(
        'en-IN',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }
      ).format(
        new Date(value)
      )
    : 'Date unavailable';


export default function MyOrders() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] =
    useSearchParams();


  const [
    orders,
    setOrders,
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
    notice,
    setNotice,
  ] = useState(() =>
    searchParams.get(
      'payment'
    ) === 'success'
      ? 'Payment confirmed. Your order is ready for seller delivery.'
      : searchParams.get(
            'payment'
          ) === 'pending'
        ? 'Payment received. Confirmation may take a moment; this page will update automatically.'
        : ''
  );

  const [
    deliveryOrder,
    setDeliveryOrder,
  ] = useState(null);

  const [
    disputeOrder,
    setDisputeOrder,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);


  const fetchOrders =
    useCallback(
      async () => {
        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();


        if (!user) {
          navigate(
            '/login'
          );

          return;
        }


        const {
          data,
          error:
            ordersError,
        } =
          await supabase
            .from(
              'orders'
            )
            .select(
              '*, accounts(*)'
            )
            .eq(
              'buyer_id',
              user.id
            )
            .order(
              'created_at',
              {
                ascending:
                  false,
              }
            );


        if (ordersError) {
          setError(
            'We could not load your orders. Please try again.'
          );

          setLoading(
            false
          );

          return;
        }


        const ids =
          (data || []).map(
            (order) =>
              order.id
          );


        let deliveries =
          [];


        if (ids.length) {
          const {
            data:
              deliveryData,
          } =
            await supabase
              .from(
                'order_deliveries'
              )
              .select('*')
              .in(
                'order_id',
                ids
              );


          deliveries =
            deliveryData ||
            [];
        }


        setOrders(
          (data || []).map(
            (order) => ({
              ...order,

              delivery:
                deliveries.find(
                  (item) =>
                    item.order_id ===
                    order.id
                ) ||
                null,
            })
          )
        );


        setError('');

        setLoading(false);
      },
      [navigate]
    );


  useEffect(() => {
    const delays =
      searchParams.has(
        'payment'
      )
        ? [
            0,
            2000,
            5000,
          ]
        : [0];


    const timers =
      delays.map(
        (delay) =>
          window.setTimeout(
            fetchOrders,
            delay
          )
      );


    return () =>
      timers.forEach(
        (timer) =>
          window.clearTimeout(
            timer
          )
      );
  }, [
    fetchOrders,
    searchParams,
  ]);


  const confirmDelivery =
    async (order) => {
      setSaving(true);

      setNotice('');


      const {
        error:
          actionError,
      } =
        await supabase.rpc(
          'confirm_marketplace_delivery',
          {
            p_order_id:
              order.id,
          }
        );


      setSaving(false);


      if (actionError) {
        setNotice(
          actionError.message
        );

        return;
      }


      setDeliveryOrder(
        null
      );


      setNotice(
        'Delivery confirmed. The order is now complete.'
      );


      await fetchOrders();
    };


  const submitDispute =
    async (event) => {
      event.preventDefault();

      setSaving(true);

      setNotice('');


      const form =
        event.currentTarget;


      const {
        error:
          actionError,
      } =
        await supabase.rpc(
          'open_marketplace_dispute',
          {
            p_order_id:
              disputeOrder.id,

            p_reason:
              form.reason.value.trim(),

            p_details:
              form.details.value.trim(),
          }
        );


      setSaving(false);


      if (actionError) {
        setNotice(
          actionError.message
        );

        return;
      }


      setDisputeOrder(
        null
      );

      setDeliveryOrder(
        null
      );


      setNotice(
        'Your dispute is open. Seller earnings are on hold while the admin reviews it.'
      );


      await fetchOrders();
    };


  return (
    <main className="my-orders-page">

      <div className="my-orders-container">


        {/* HEADER */}

        <div className="my-orders-header">

          <div>

            <p className="my-orders-kicker">
              Buyer account
            </p>


            <h1 className="my-orders-title">
              My orders
            </h1>


            <p className="my-orders-subtitle">
              Receive deliveries,
              confirm orders and request
              help in one place.
            </p>

          </div>


          <Link
            to="/#games"
            className="my-orders-browse-link"
          >
            Browse games

            <span className="my-orders-browse-arrow">
              →
            </span>
          </Link>

        </div>


        {/* NOTICE */}

        {notice && (

          <p className="my-orders-notice">
            {notice}
          </p>

        )}


        {/* ORDER HISTORY */}

        <section className="my-orders-panel">

          <div className="my-orders-panel-header">

            <span className="my-orders-panel-icon">
              <PackageIcon />
            </span>


            <div>

              <h2 className="my-orders-panel-title">
                Order history
              </h2>


              <p className="my-orders-panel-count">

                {loading
                  ? 'Checking your purchases…'
                  : `${orders.length} ${
                      orders.length ===
                      1
                        ? 'order'
                        : 'orders'
                    }`}

              </p>

            </div>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="my-orders-loading">

              {[1, 2].map(
                (item) => (

                  <div
                    key={
                      item
                    }
                    className="my-orders-loading-card"
                  />

                )
              )}

            </div>

          ) : error ? (

            <div className="my-orders-error">
              {error}
            </div>

          ) : !orders.length ? (

            <div className="my-orders-empty">

              <span className="my-orders-empty-icon">
                <PackageIcon />
              </span>


              <h2 className="my-orders-empty-title">
                No orders yet
              </h2>


              <p className="my-orders-empty-text">
                Your purchases will
                appear here.
              </p>

            </div>

          ) : (

            <div className="my-orders-list">

              {orders.map(
                (order) => {
                  const account =
                    order.accounts ||
                    {};


                  const status =
                    (
                      order.status ||
                      'pending'
                    ).toLowerCase();


                  const price =
                    order.amount ??
                    account.price;


                  const title =
                    account.title ||
                    (
                      account.town_hall
                        ? `Town Hall ${account.town_hall} Account`
                        : 'Game account'
                    );


                  return (
                    <article
                      key={
                        order.id
                      }
                      className="my-order-card"
                    >

                      <div className="my-order-main">


                        {/* IMAGE */}

                        <div className="my-order-image-wrap">

                          {account.thumbnail_url ||
                          account.image_url ? (

                            <img
                              src={
                                account.thumbnail_url ||
                                account.image_url
                              }
                              alt=""
                              className="my-order-image"
                            />

                          ) : (

                            <div className="my-order-image-placeholder">
                              <PackageIcon />
                            </div>

                          )}

                        </div>


                        {/* DETAILS */}

                        <div className="my-order-info">

                          <div className="my-order-meta">

                            <span
                              className={
                                statusStyle[
                                  status
                                ] ||
                                statusStyle
                                  .pending
                              }
                            >
                              {status}
                            </span>


                            <span className="my-order-id">
                              #
                              {String(
                                order.id
                              )
                                .slice(
                                  0,
                                  8
                                )
                                .toUpperCase()}
                            </span>

                          </div>


                          <h3 className="my-order-title">
                            {title}
                          </h3>


                          <p className="my-order-status-text">
                            {statusText[
                              status
                            ] ||
                              status}
                          </p>


                          <p className="my-order-date">
                            Purchased{' '}
                            {formatDate(
                              order.created_at
                            )}
                          </p>

                        </div>


                        {/* PRICE */}

                        <div className="my-order-price-area">

                          <div>

                            <p className="my-order-total-label">
                              Total
                            </p>


                            <p className="my-order-price">
                              ₹
                              {Number(
                                price ||
                                  0
                              ).toLocaleString(
                                'en-IN'
                              )}
                            </p>

                          </div>


                          {account.id && (

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/account/${account.id}`
                                )
                              }
                              className="my-order-listing-button"
                            >
                              Listing

                              <ArrowIcon />
                            </button>

                          )}

                        </div>

                      </div>


                      {/* ACTIONS */}

                      <div className="my-order-actions">

                        {order.delivery &&
                          [
                            'delivered',
                            'completed',
                            'disputed',
                          ].includes(
                            status
                          ) && (

                          <button
                            type="button"
                            onClick={() =>
                              setDeliveryOrder(
                                order
                              )
                            }
                            className="my-order-action my-order-action-primary"
                          >
                            View private delivery
                          </button>

                        )}


                        {status ===
                          'delivered' && (
                          <>

                            <button
                              type="button"
                              disabled={
                                saving
                              }
                              onClick={() =>
                                confirmDelivery(
                                  order
                                )
                              }
                              className="my-order-action my-order-action-confirm"
                            >
                              Confirm delivery
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                setDisputeOrder(
                                  order
                                )
                              }
                              className="my-order-action my-order-action-danger"
                            >
                              Report a problem
                            </button>

                          </>
                        )}


                        {status ===
                          'paid' && (

                          <p className="my-order-info-message my-order-info-paid">
                            The seller has
                            been notified
                            to provide
                            delivery.
                          </p>

                        )}


                        {status ===
                          'disputed' && (

                          <p className="my-order-info-message my-order-info-disputed">
                            The order and
                            seller payout
                            are locked
                            during review.
                          </p>

                        )}

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>


      {/* DELIVERY MODAL */}

      {deliveryOrder && (

        <DeliveryModal
          order={
            deliveryOrder
          }
          onClose={() =>
            setDeliveryOrder(
              null
            )
          }
          onConfirm={() =>
            confirmDelivery(
              deliveryOrder
            )
          }
          onDispute={() =>
            setDisputeOrder(
              deliveryOrder
            )
          }
          saving={
            saving
          }
        />

      )}


      {/* DISPUTE MODAL */}

      {disputeOrder && (

        <div
          className="my-orders-modal-overlay"
          onMouseDown={() =>
            setDisputeOrder(
              null
            )
          }
        >

          <form
            onSubmit={
              submitDispute
            }
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
            className="my-orders-modal"
          >

            <h2 className="my-orders-modal-title">
              Report a delivery problem
            </h2>


            <p className="my-orders-modal-description">
              Seller funds will be held
              while the admin reviews
              your report.
            </p>


            <label className="my-orders-modal-field">

              Reason

              <input
                name="reason"
                required
                minLength="3"
                maxLength="80"
                placeholder="Example: Password does not work"
                className="my-orders-modal-input"
              />

            </label>


            <label className="my-orders-modal-field">

              Details

              <textarea
                name="details"
                required
                minLength="10"
                maxLength="2000"
                rows="5"
                placeholder="Explain exactly what happened."
                className="my-orders-modal-textarea"
              />

            </label>


            <div className="my-orders-modal-actions">

              <button
                type="button"
                onClick={() =>
                  setDisputeOrder(
                    null
                  )
                }
                className="my-orders-modal-cancel"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={
                  saving
                }
                className="my-orders-modal-danger"
              >
                Open dispute
              </button>

            </div>

          </form>

        </div>

      )}

    </main>
  );
}


function DeliveryModal({
  order,
  onClose,
  onConfirm,
  onDispute,
  saving,
}) {
  const details =
    order.delivery
      ?.delivery_payload ||
    {};


  const type =
    order.accounts
      ?.listing_type ||
    'account';


  const rows = [
    [
      'Login email',
      details.email,
    ],
    [
      'Username / ID',
      details.username,
    ],
    [
      'Password',
      details.password,
    ],
    [
      'Recovery details',
      details.recovery,
    ],
    [
      'Item code / reference',
      details.code,
    ],
    [
      type ===
      'service'
        ? 'Service completion details'
        : 'Seller notes',
      details.notes,
    ],
  ].filter(
    ([, value]) =>
      value
  );


  return (
    <div
      className="my-orders-modal-overlay my-orders-delivery-overlay"
      onMouseDown={
        onClose
      }
    >

      <div
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className="my-orders-delivery-modal"
      >

        <div className="my-orders-delivery-header">

          <div>

            <p className="my-orders-delivery-kicker">
              Private delivery
            </p>


            <h2 className="my-orders-delivery-title">
              Your account details
            </h2>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="my-orders-modal-close"
          >
            ×
          </button>

        </div>


        <div className="my-orders-delivery-rows">

          {rows.map(
            ([
              label,
              value,
            ]) => (

              <div
                key={
                  label
                }
                className="my-orders-delivery-row"
              >

                <p className="my-orders-delivery-label">
                  {label}
                </p>


                <p className="my-orders-delivery-value">
                  {value}
                </p>

              </div>

            )
          )}

        </div>


        <p className="my-orders-delivery-warning">
          Test the details and secure
          the account before
          confirming. Do not share
          these details.
        </p>


        {order.status ===
          'delivered' && (

          <div className="my-orders-delivery-actions">

            <button
              type="button"
              onClick={
                onDispute
              }
              className="my-orders-modal-cancel my-order-action-danger"
            >
              Report a problem
            </button>


            <button
              type="button"
              disabled={
                saving
              }
              onClick={
                onConfirm
              }
              className="my-orders-modal-confirm"
            >
              Everything works
            </button>

          </div>

        )}

      </div>

    </div>
  );
}