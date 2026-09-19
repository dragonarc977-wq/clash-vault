'use client';

import { useCallback, useEffect, useState } from 'react';
import supabase from '../lib/supabase';



const money = (value, currency = 'INR') =>
  `${currency === 'USD' ? '$' : '₹'}${Number(value || 0).toLocaleString('en-IN')}`;


const date = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : '—';


export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');


  const load = useCallback(async () => {
    const [
      { data: profiles, error: sellerError },
      { data: requests, error: withdrawalError },
      { data: cases, error: disputeError },
    ] = await Promise.all([
      supabase
        .from('seller_profiles')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('withdrawal_requests')
        .select('*, seller_profiles(display_name,email)')
        .order('created_at', { ascending: false }),

      supabase
        .from('order_disputes')
        .select('*, orders(buyer_email,amount)')
        .order('created_at', { ascending: false }),
    ]);


    if (
      sellerError ||
      withdrawalError ||
      disputeError
    ) {
      setNotice(
        'Could not load all seller information.'
      );
    }


    setSellers(profiles || []);
    setWithdrawals(requests || []);
    setDisputes(cases || []);
    setLoading(false);
  }, []);


  useEffect(() => {
    const timer = window.setTimeout(load, 0);

    return () =>
      window.clearTimeout(timer);
  }, [load]);


  async function review(userId, status) {
    const notes =
      status === 'approved'
        ? ''
        : window.prompt(
            'Reason shown to the seller:'
          ) || '';


    const seller = sellers.find(
      (item) => item.user_id === userId
    );


    const { error } = await supabase.rpc(
      'review_seller_application',
      {
        p_user_id: userId,
        p_status: status,
        p_notes: notes || null,
        p_commission: Number(
          seller?.commission_rate || 15
        ),
      }
    );


    if (error) {
      setNotice(error.message);
    } else {
      setNotice(`Seller ${status}.`);
      load();
    }
  }


  async function reviewListing(id, status) {
    const { error } = await supabase
      .from('accounts')
      .update({
        moderation_status: status,

        moderation_notes:
          status === 'rejected'
            ? window.prompt(
                'Reason for rejection:'
              ) || null
            : null,
      })
      .eq('id', id);


    if (error) {
      setNotice(error.message);

      return false;
    }


    setNotice(`Listing ${status}.`);

    return true;
  }


  async function updateWithdrawal(id, status) {
    const payload = {
      status,

      reviewed_at: new Date().toISOString(),

      paid_at:
        status === 'paid'
          ? new Date().toISOString()
          : null,
    };


    const { error } = await supabase
      .from('withdrawal_requests')
      .update(payload)
      .eq('id', id);


    if (error) {
      setNotice(error.message);
    } else {
      setNotice(
        `Withdrawal marked ${status}.`
      );

      load();
    }
  }


  async function resolveDispute(
    id,
    resolution
  ) {
    const notes =
      window.prompt(
        'Resolution note shown in the case history:'
      ) || '';


    const { error } = await supabase.rpc(
      'resolve_marketplace_dispute',
      {
        p_dispute_id: id,
        p_resolution: resolution,
        p_notes: notes || null,
      }
    );


    if (error) {
      setNotice(error.message);
    } else {
      setNotice(
        resolution === 'buyer'
          ? 'Dispute resolved for buyer. Complete any required refund through the payment provider.'
          : 'Dispute resolved for seller. Seller funds were released.'
      );

      load();
    }
  }


  const pending = sellers.filter(
    (item) => item.status === 'pending'
  );


  return (
    <div className="admin-sellers">

      {notice && (
        <div className="admin-sellers-notice">
          {notice}
        </div>
      )}


      {/* SELLER APPLICATIONS */}

      <section className="admin-sellers-section">

        <div className="admin-sellers-header">

          <div>
            <h2 className="admin-sellers-title">
              Seller applications
            </h2>

            <p className="admin-sellers-subtitle">
              Verify applicants before they can
              list or withdraw.
            </p>
          </div>


          <span className="admin-sellers-counter admin-sellers-counter-pending">
            {pending.length} pending
          </span>

        </div>


        {loading ? (
          <Loading />
        ) : sellers.length ? (

          <div className="admin-sellers-list">

            {sellers.map((seller) => (

              <div
                key={seller.user_id}
                className="admin-seller-row"
              >

                <div className="admin-seller-main">

                  <div className="admin-seller-heading">

                    <p className="admin-seller-name">
                      {seller.display_name}
                    </p>

                    <Badge
                      status={seller.status}
                    />

                  </div>


                  <p className="admin-seller-detail">
                    {seller.legal_name} ·{' '}
                    {seller.email} ·{' '}
                    {seller.phone}
                  </p>


                  <p className="admin-seller-meta">
                    {seller.country} ·{' '}
                    {(seller.categories || []).join(
                      ', '
                    )}{' '}
                    · Applied{' '}
                    {date(seller.created_at)}
                  </p>

                </div>


                <label className="admin-seller-commission">

                  Commission %

                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={
                      seller.commission_rate
                    }
                    onChange={(event) =>
                      setSellers((current) =>
                        current.map((item) =>
                          item.user_id ===
                          seller.user_id
                            ? {
                                ...item,
                                commission_rate:
                                  event.target
                                    .value,
                              }
                            : item
                        )
                      )
                    }
                    className="admin-seller-commission-input"
                  />

                </label>


                <div className="admin-seller-actions">

                  {seller.status !==
                    'approved' && (

                    <button
                      type="button"
                      onClick={() =>
                        review(
                          seller.user_id,
                          'approved'
                        )
                      }
                      className="admin-sellers-button admin-sellers-button-primary"
                    >
                      Approve
                    </button>

                  )}


                  {seller.status ===
                    'approved' && (

                    <button
                      type="button"
                      onClick={() =>
                        review(
                          seller.user_id,
                          'suspended'
                        )
                      }
                      className="admin-sellers-button admin-sellers-button-danger"
                    >
                      Suspend
                    </button>

                  )}


                  {seller.status ===
                    'pending' && (

                    <button
                      type="button"
                      onClick={() =>
                        review(
                          seller.user_id,
                          'rejected'
                        )
                      }
                      className="admin-sellers-button admin-sellers-button-outline"
                    >
                      Reject
                    </button>

                  )}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <Empty text="No seller applications." />

        )}

      </section>


      {/* PENDING LISTINGS */}

      <PendingListings
        onReview={reviewListing}
      />


      {/* ORDER DISPUTES */}

      <section className="admin-sellers-section">

        <div className="admin-sellers-header">

          <div>

            <h2 className="admin-sellers-title">
              Order disputes
            </h2>

            <p className="admin-sellers-subtitle">
              Review buyer reports before
              releasing seller funds.
            </p>

          </div>


          <span className="admin-sellers-counter admin-sellers-counter-danger">
            {
              disputes.filter(
                (item) =>
                  item.status === 'open'
              ).length
            }{' '}
            open
          </span>

        </div>


        {disputes.length ? (

          <div className="admin-sellers-list">

            {disputes.map((item) => (

              <div
                key={item.id}
                className="admin-dispute-row"
              >

                <div className="admin-dispute-main">

                  <div className="admin-dispute-heading">

                    <p className="admin-dispute-order">
                      Order #
                      {item.order_id
                        .slice(0, 8)
                        .toUpperCase()}{' '}
                      ·{' '}
                      {money(
                        item.orders?.amount
                      )}
                    </p>


                    <Badge
                      status={item.status}
                    />

                  </div>


                  <p className="admin-dispute-reason">
                    {item.reason}
                  </p>


                  <p className="admin-dispute-details">
                    {item.details}
                  </p>


                  <p className="admin-dispute-meta">
                    Buyer:{' '}
                    {item.orders?.buyer_email ||
                      '—'}{' '}
                    · Seller ID:{' '}
                    {String(
                      item.seller_id || ''
                    )
                      .slice(0, 8)
                      .toUpperCase()}{' '}
                    ·{' '}
                    {date(item.created_at)}
                  </p>


                  {item.resolution_notes && (

                    <p className="admin-dispute-resolution">
                      Resolution:{' '}
                      {item.resolution_notes}
                    </p>

                  )}

                </div>


                {item.status === 'open' && (

                  <div className="admin-dispute-actions">

                    <button
                      type="button"
                      onClick={() =>
                        resolveDispute(
                          item.id,
                          'buyer'
                        )
                      }
                      className="admin-sellers-button admin-sellers-button-danger"
                    >
                      Resolve for buyer
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        resolveDispute(
                          item.id,
                          'seller'
                        )
                      }
                      className="admin-sellers-button admin-sellers-button-primary"
                    >
                      Release seller funds
                    </button>

                  </div>

                )}

              </div>

            ))}

          </div>

        ) : (

          <Empty text="No order disputes." />

        )}

      </section>


      {/* WITHDRAWALS */}

      <section className="admin-sellers-section">

        <div className="admin-sellers-header-simple">

          <h2 className="admin-sellers-title">
            Withdrawal requests
          </h2>

          <p className="admin-sellers-subtitle">
            Pay sellers manually, then mark
            requests paid.
          </p>

        </div>


        {withdrawals.length ? (

          <div className="admin-sellers-list">

            {withdrawals.map((item) => (

              <div
                key={item.id}
                className="admin-withdrawal-row"
              >

                <div>

                  <p className="admin-withdrawal-name">
                    {item.seller_profiles
                      ?.display_name ||
                      'Seller'}{' '}
                    ·{' '}
                    {money(
                      item.amount,
                      item.currency
                    )}
                  </p>


                  <p className="admin-withdrawal-meta">
                    {item.seller_profiles
                      ?.email}{' '}
                    ·{' '}
                    {date(item.created_at)} ·{' '}
                    {item.payout_note ||
                      'No payout note'}
                  </p>

                </div>


                <Badge status={item.status} />


                <div className="admin-withdrawal-actions">

                  {item.status ===
                    'pending' && (
                    <>

                      <button
                        type="button"
                        onClick={() =>
                          updateWithdrawal(
                            item.id,
                            'paid'
                          )
                        }
                        className="admin-sellers-button admin-sellers-button-primary"
                      >
                        Mark paid
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          updateWithdrawal(
                            item.id,
                            'rejected'
                          )
                        }
                        className="admin-sellers-button admin-sellers-button-outline"
                      >
                        Reject
                      </button>

                    </>
                  )}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <Empty text="No withdrawal requests." />

        )}

      </section>

    </div>
  );
}


function PendingListings({ onReview }) {
  const [items, setItems] = useState([]);


  useEffect(() => {
    supabase
      .from('accounts')
      .select(
        '*, seller_profiles(display_name)'
      )
      .eq(
        'moderation_status',
        'pending'
      )
      .order('created_at', {
        ascending: false,
      })
      .then(({ data }) =>
        setItems(data || [])
      );
  }, []);


  if (!items.length) {
    return null;
  }


  return (
    <section className="admin-sellers-section">

      <div className="admin-sellers-header-simple">

        <h2 className="admin-sellers-title">
          Listings awaiting review
        </h2>

      </div>


      <div className="admin-sellers-list">

        {items.map((item) => (

          <div
            key={item.id}
            className="admin-pending-row"
          >

            <div className="admin-pending-main">

              <img
                src={
                  item.thumbnail_url ||
                  item.image_url
                }
                alt=""
                className="admin-pending-image"
              />


              <div>

                <p className="admin-pending-name">
                  {
                    item.seller_profiles
                      ?.display_name
                  }{' '}
                  · {item.game_id}
                </p>


                <p className="admin-pending-meta">
                  Level {item.town_hall} ·{' '}
                  {money(item.price)}
                </p>

              </div>

            </div>


            <div className="admin-pending-actions">

              <button
                type="button"
                onClick={async () => {
                  await onReview(
                    item.id,
                    'approved'
                  );

                  setItems((current) =>
                    current.filter(
                      (row) =>
                        row.id !== item.id
                    )
                  );
                }}
                className="admin-sellers-button admin-sellers-button-primary"
              >
                Approve
              </button>


              <button
                type="button"
                onClick={async () => {
                  await onReview(
                    item.id,
                    'rejected'
                  );

                  setItems((current) =>
                    current.filter(
                      (row) =>
                        row.id !== item.id
                    )
                  );
                }}
                className="admin-sellers-button admin-sellers-button-outline"
              >
                Reject
              </button>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}


function Badge({ status }) {
  const tone =
    status === 'approved' ||
    status === 'paid'
      ? 'admin-sellers-badge-success'
      : status === 'rejected' ||
          status === 'suspended'
        ? 'admin-sellers-badge-danger'
        : 'admin-sellers-badge-warning';


  return (
    <span
      className={`admin-sellers-badge ${tone}`}
    >
      {status}
    </span>
  );
}


function Loading() {
  return (
    <div className="admin-sellers-loading">

      {[1, 2, 3].map((item) => (

        <div
          key={item}
          className="admin-sellers-loading-row"
        />

      ))}

    </div>
  );
}


function Empty({ text }) {
  return (
    <div className="admin-sellers-empty">
      {text}
    </div>
  );
}