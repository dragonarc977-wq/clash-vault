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



const currencies = [
  {
    value: 'INR',
    label: 'Indian Rupee',
    symbol: '₹',
  },
  {
    value: 'USD',
    label: 'US Dollar',
    symbol: '$',
  },
];


const UserIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      d="M19 20a7 7 0 0 0-14 0m11-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
    />
  </svg>
);


const WalletIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      d="M4 6.5h15.5v12H4v-12Zm0 3h15.5M15 14h2"
    />
  </svg>
);


export default function Dashboard() {
  const navigate = useNavigate();

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    publicId,
    setPublicId,
  ] = useState(null);

  const [
    currency,
    setCurrency,
  ] = useState('INR');

  const [
    avatarUploading,
    setAvatarUploading,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');


  useEffect(() => {
    let active = true;


    const loadBuyer =
      async () => {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();


        if (!active) {
          return;
        }


        if (!session?.user) {
          navigate('/login');

          return;
        }


        const buyer =
          session.user;


        const savedCurrency =
          buyer.user_metadata
            ?.currency ||
          localStorage.getItem(
            'clashvault_currency'
          ) ||
          'INR';


        const {
          data: permanentId,
        } =
          await supabase.rpc(
            'get_my_public_id'
          );


        if (!active) {
          return;
        }


        setUser(buyer);

        setPublicId(
          permanentId
        );

        setCurrency(
          savedCurrency
        );

        setLoading(false);
      };


    loadBuyer();


    return () => {
      active = false;
    };
  }, [navigate]);


  const saveProfile =
    async (event) => {
      event.preventDefault();

      setError('');

      setMessage('');

      setSaving(true);


      const {
        data,
        error: updateError,
      } =
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            currency,
          },
        });


      setSaving(false);


      if (updateError) {
        setError(
          updateError.message ||
            'We could not save your changes. Please try again.'
        );

        return;
      }


      setUser(
        data.user
      );


      localStorage.setItem(
        'clashvault_currency',
        currency
      );


      window.dispatchEvent(
        new CustomEvent(
          'clashvault-preferences',
          {
            detail: {
              currency,
            },
          }
        )
      );


      setMessage(
        'Your account settings have been saved.'
      );
    };


  const uploadProfilePicture =
    async (event) => {
      const file =
        event.target.files?.[0];


      event.target.value = '';


      if (!file) {
        return;
      }


      setError('');

      setMessage('');


      if (
        ![
          'image/jpeg',
          'image/png',
          'image/webp',
        ].includes(file.type) ||
        file.size >
          2 * 1024 * 1024
      ) {
        setError(
          'Profile picture must be JPG, PNG or WebP and smaller than 2 MB.'
        );

        return;
      }


      setAvatarUploading(true);


      const path =
        `${user.id}/profile-picture`;


      const bucket =
        supabase.storage.from(
          'profile-avatars'
        );


      const {
        error: uploadError,
      } =
        await bucket.upload(
          path,
          file,
          {
            upsert: true,
            contentType:
              file.type,
            cacheControl:
              '3600',
          }
        );


      if (uploadError) {
        setError(
          uploadError.message
        );

        setAvatarUploading(
          false
        );

        return;
      }


      const avatarUrl =
        `${
          bucket.getPublicUrl(
            path
          ).data.publicUrl
        }?v=${Date.now()}`;


      const {
        data,
        error: updateError,
      } =
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            avatar_url:
              avatarUrl,
          },
        });


      if (!updateError) {
        await Promise.all([
          supabase
            .from(
              'user_profiles'
            )
            .update({
              avatar_url:
                avatarUrl,
            })
            .eq(
              'user_id',
              user.id
            ),

          supabase
            .from(
              'seller_profiles'
            )
            .update({
              avatar_url:
                avatarUrl,
            })
            .eq(
              'user_id',
              user.id
            ),
        ]);
      }


      if (updateError) {
        setError(
          updateError.message
        );
      } else {
        setUser(
          data.user
        );

        setMessage(
          'Profile picture updated.'
        );
      }


      setAvatarUploading(false);
    };


  if (loading) {
    return (
      <main className="dashboard-loading-page">

        <div className="dashboard-loading">

          <div className="dashboard-loading-title" />

          <div className="dashboard-loading-card" />

        </div>

      </main>
    );
  }


  const displayName =
    user?.user_metadata
      ?.full_name ||
    user?.email
      ?.split('@')[0] ||
    'Buyer';


  return (
    <main className="dashboard-page">

      <div className="dashboard-container">


        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <p className="dashboard-kicker">
              Buyer account
            </p>


            <h1 className="dashboard-title">
              Welcome, {displayName}
            </h1>


            <p className="dashboard-subtitle">
              Manage your identity and
              marketplace preferences.
            </p>

          </div>


          <Link
            to="/my-orders"
            className="dashboard-orders-link"
          >
            View my orders

            <span className="dashboard-orders-arrow">
              →
            </span>
          </Link>

        </div>


        {/* FORM */}

        <form
          onSubmit={
            saveProfile
          }
          className="dashboard-form"
        >


          {/* ACCOUNT DETAILS */}

          <section className="dashboard-card">

            <div className="dashboard-card-header">

              <span className="dashboard-card-icon">
                <UserIcon />
              </span>


              <div>

                <h2 className="dashboard-card-title">
                  Account details
                </h2>


                <p className="dashboard-card-description">
                  Your buyer identity on
                  AllGamersMarket.
                </p>

              </div>

            </div>


            {/* PROFILE PICTURE */}

            <div className="dashboard-avatar-box">

              <span className="dashboard-avatar">

                {user?.user_metadata
                  ?.avatar_url ? (

                  <img
                    src={
                      user.user_metadata
                        .avatar_url
                    }
                    alt="Profile"
                    className="dashboard-avatar-image"
                  />

                ) : (

                  displayName
                    .charAt(0)
                    .toUpperCase()

                )}

              </span>


              <div>

                <p className="dashboard-avatar-title">
                  Profile picture
                </p>


                <p className="dashboard-avatar-help">
                  JPG, PNG or WebP ·
                  maximum 2 MB
                </p>


                <label className="dashboard-avatar-upload">

                  <span>
                    {avatarUploading
                      ? 'Uploading…'
                      : user
                          ?.user_metadata
                          ?.avatar_url
                        ? 'Change picture'
                        : 'Set up picture'}
                  </span>


                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={
                      avatarUploading
                    }
                    onChange={
                      uploadProfilePicture
                    }
                    className="dashboard-file-input"
                  />

                </label>

              </div>

            </div>


            {/* ACCOUNT FIELDS */}

            <div className="dashboard-fields">

              <label className="dashboard-field">

                <span className="dashboard-field-label">
                  Email address
                </span>


                <input
                  value={
                    user?.email ||
                    ''
                  }
                  readOnly
                  className="dashboard-input"
                />


                <span className="dashboard-field-help">
                  Your sign-in email
                  cannot be changed here.
                </span>

              </label>


              <div className="dashboard-field">

                <span className="dashboard-field-label">
                  User ID
                </span>


                <div className="dashboard-public-id">

                  <span className="dashboard-public-id-prefix">
                    ID
                  </span>


                  <span className="dashboard-public-id-value">
                    {publicId ||
                      '••••••'}
                  </span>

                </div>


                <span className="dashboard-field-help">
                  Your permanent account
                  ID is assigned
                  automatically and
                  cannot be changed.
                </span>

              </div>

            </div>

          </section>


          {/* CURRENCY */}

          <section className="dashboard-card">

            <div className="dashboard-card-header">

              <span className="dashboard-card-icon">
                <WalletIcon />
              </span>


              <div>

                <h2 className="dashboard-card-title">
                  Currency
                </h2>


                <p className="dashboard-card-description">
                  Prices will be shown in
                  your preferred
                  currency.
                </p>

              </div>

            </div>


            <div className="dashboard-currency-grid">

              {currencies.map(
                (option) => {
                  const selected =
                    currency ===
                    option.value;


                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      onClick={() =>
                        setCurrency(
                          option.value
                        )
                      }
                      className={
                        selected
                          ? 'dashboard-currency-option dashboard-currency-option-selected'
                          : 'dashboard-currency-option'
                      }
                    >

                      <span className="dashboard-currency-symbol">
                        {option.symbol}
                      </span>


                      <span>

                        <span className="dashboard-currency-code">
                          {option.value}
                        </span>


                        <span className="dashboard-currency-name">
                          {option.label}
                        </span>

                      </span>


                      <span className="dashboard-currency-radio" />

                    </button>
                  );
                }
              )}

            </div>

          </section>


          {/* SAVE */}

          <div className="dashboard-actions">

            {error && (

              <p className="dashboard-error">
                {error}
              </p>

            )}


            {message && (

              <p className="dashboard-success">
                {message}
              </p>

            )}


            <button
              type="submit"
              disabled={
                saving
              }
              className="dashboard-save-button"
            >
              {saving
                ? 'Saving…'
                : 'Save changes'}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}