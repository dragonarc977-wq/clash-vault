'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from '../lib/navigation';

import supabase from '../lib/supabase';



const categories = [
  'Accounts',
  'Items',
  'Top-ups',
  'Services',
];


const inputClass =
  'seller-onboarding-input';


export default function SellerOnboarding() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [selected, setSelected] =
    useState(['Accounts']);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');


  useEffect(() => {
    let active = true;


    (async () => {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();


      if (!session?.user) {
        navigate('/login');

        return;
      }


      const { data } =
        await supabase
          .from('seller_profiles')
          .select('*')
          .eq(
            'user_id',
            session.user.id
          )
          .maybeSingle();


      if (!active) {
        return;
      }


      setUser(session.user);

      setProfile(data);


      if (
        data?.categories?.length
      ) {
        setSelected(
          data.categories
        );
      }


      setLoading(false);
    })();


    return () => {
      active = false;
    };
  }, [navigate]);


  async function submit(event) {
    event.preventDefault();


    if (!selected.length) {
      setError(
        'Choose at least one category.'
      );

      return;
    }


    const form =
      event.currentTarget;


    setSaving(true);

    setError('');


    const payload = {
      user_id:
        user.id,

      display_name:
        form.displayName.value.trim(),

      legal_name:
        form.legalName.value.trim(),

      email:
        user.email,

      phone:
        form.phone.value.trim(),

      country:
        form.country.value.trim(),

      categories:
        selected,

      experience:
        form.experience.value.trim() ||
        null,
    };


    const {
      data,
      error: saveError,
    } =
      await supabase
        .from('seller_profiles')
        .upsert(
          payload,
          {
            onConflict:
              'user_id',
          }
        )
        .select('*')
        .single();


    setSaving(false);


    if (saveError) {
      setError(
        saveError.message
      );

      return;
    }


    setProfile(data);
  }


  if (loading) {
    return (
      <main className="seller-onboarding-loading-page">

        <div className="seller-onboarding-loading-card" />

      </main>
    );
  }


  if (
    profile &&
    profile.status !== 'rejected'
  ) {
    const approved =
      profile.status ===
      'approved';


    const suspended =
      profile.status ===
      'suspended';


    const iconClass =
      approved
        ? 'seller-status-icon seller-status-icon-approved'
        : suspended
          ? 'seller-status-icon seller-status-icon-suspended'
          : 'seller-status-icon seller-status-icon-pending';


    return (
      <main className="seller-status-page">

        <section className="seller-status-card">

          <span className={iconClass}>
            {approved
              ? '✓'
              : '⌛'}
          </span>


          <p className="seller-status-kicker">
            Seller application
          </p>


          <h1 className="seller-status-title">

            {approved
              ? 'You are an approved seller'
              : suspended
                ? 'Seller account suspended'
                : 'Application under review'}

          </h1>


          <p className="seller-status-copy">

            {approved
              ? 'Your seller workspace is ready. Create listings, follow their review status, manage sales and request withdrawals.'
              : suspended
                ? 'Contact support for information about your seller account.'
                : 'Our team will review your details. You cannot publish listings or request withdrawals until approval.'}

          </p>


          <div className="seller-status-actions">

            {approved && (

              <Link
                to="/seller"
                className="seller-status-primary"
              >
                Open seller dashboard
              </Link>

            )}


            <Link
              to="/support"
              className="seller-status-secondary"
            >
              Contact support
            </Link>

          </div>

        </section>

      </main>
    );
  }


  return (
    <main className="seller-onboarding-page">

      <div className="seller-onboarding-container">

        <p className="seller-onboarding-kicker">
          Sell on AllGamersMarket
        </p>


        <h1 className="seller-onboarding-title">
          Become a verified seller
        </h1>


        <p className="seller-onboarding-description">
          Submit your details for
          manual review. Approval is
          required before any listing
          can appear in the marketplace.
        </p>


        {profile?.status ===
          'rejected' && (

          <div className="seller-onboarding-rejected">

            <strong>
              Your previous application
              was not approved.
            </strong>


            <p>
              {profile.admin_notes ||
                'Update your information and submit it again.'}
            </p>

          </div>

        )}


        <form
          onSubmit={submit}
          className="seller-onboarding-form"
        >

          <div className="seller-onboarding-grid">

            <label className="seller-onboarding-field">

              Seller display name *

              <input
                name="displayName"
                required
                maxLength="40"
                defaultValue={
                  profile?.display_name ||
                  user?.user_metadata
                    ?.username ||
                  ''
                }
                placeholder="Shown to buyers"
                className={
                  inputClass
                }
              />

            </label>


            <label className="seller-onboarding-field">

              Legal name *

              <input
                name="legalName"
                required
                maxLength="80"
                defaultValue={
                  profile?.legal_name ||
                  user?.user_metadata
                    ?.full_name ||
                  ''
                }
                placeholder="As shown on your ID"
                className={
                  inputClass
                }
              />

            </label>


            <label className="seller-onboarding-field">

              Account email

              <input
                value={
                  user?.email ||
                  ''
                }
                readOnly
                className={
                  inputClass
                }
              />

            </label>


            <label className="seller-onboarding-field">

              Phone number *

              <input
                name="phone"
                required
                maxLength="24"
                defaultValue={
                  profile?.phone ||
                  ''
                }
                placeholder="Include country code"
                className={
                  inputClass
                }
              />

            </label>


            <label className="seller-onboarding-field seller-onboarding-field-wide">

              Country *

              <input
                name="country"
                required
                maxLength="60"
                defaultValue={
                  profile?.country ||
                  'India'
                }
                className={
                  inputClass
                }
              />

            </label>

          </div>


          {/* CATEGORIES */}

          <div className="seller-onboarding-categories">

            <p className="seller-onboarding-section-label">
              What will you sell? *
            </p>


            <div className="seller-onboarding-category-grid">

              {categories.map(
                (category) => {

                  const isSelected =
                    selected.includes(
                      category
                    );


                  return (
                    <button
                      key={
                        category
                      }
                      type="button"
                      onClick={() =>
                        setSelected(
                          (
                            current
                          ) =>
                            current.includes(
                              category
                            )
                              ? current.filter(
                                  (
                                    item
                                  ) =>
                                    item !==
                                    category
                                )
                              : [
                                  ...current,
                                  category,
                                ]
                        )
                      }
                      className={
                        isSelected
                          ? 'seller-onboarding-category active'
                          : 'seller-onboarding-category'
                      }
                    >
                      {category}
                    </button>
                  );
                }
              )}

            </div>

          </div>


          {/* EXPERIENCE */}

          <label className="seller-onboarding-field seller-onboarding-field-spaced">

            Selling experience

            <textarea
              name="experience"
              rows="4"
              defaultValue={
                profile?.experience ||
                ''
              }
              placeholder="Tell us what you sell and how you source it."
              className="seller-onboarding-input seller-onboarding-textarea"
            />

          </label>


          {/* AUTHORIZATION */}

          <div className="seller-onboarding-rule">

            <strong>
              Strict authorization rule:
            </strong>{' '}

            you may not list an
            account, item or service if
            the game publisher
            prohibits its sale or
            transfer. Ownership of
            login credentials is not
            enough.

          </div>


          {/* CONSENT */}

          <label className="seller-onboarding-consent">

            <input
              required
              type="checkbox"
              className="seller-onboarding-checkbox"
            />


            <span>

              I am 18+, my details are
              accurate, I can prove
              lawful ownership and
              publisher authorization
              for every listing, and I
              accept the{' '}

              <Link
                to="/terms"
                target="_blank"
              >
                Terms
              </Link>

              {' '}and{' '}

              <Link
                to="/marketplace-rules"
                target="_blank"
              >
                Marketplace Rules
              </Link>

              , including verification,
              delayed payouts and
              dispute decisions.

            </span>

          </label>


          {error && (

            <p className="seller-onboarding-error">
              {error}
            </p>

          )}


          <button
            disabled={saving}
            className="seller-onboarding-submit"
          >

            {saving
              ? 'Submitting…'
              : profile
                ? 'Resubmit application'
                : 'Submit application'}

          </button>

        </form>

      </div>

    </main>
  );
}