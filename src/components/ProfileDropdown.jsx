import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import supabase from '../lib/supabase';
import {
  applyTheme,
  getTheme,
  MARKETPLACE_THEMES,
} from '../lib/theme';

import '../styles/profile-dropdown.css';


const DashboardIcon = () => (
  <svg
    className="profile-menu-icon"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="4" y="4" width="6" height="6" rx="1" strokeWidth="1.7" />
    <rect x="14" y="4" width="6" height="6" rx="1" strokeWidth="1.7" />
    <rect x="4" y="14" width="6" height="6" rx="1" strokeWidth="1.7" />
    <rect x="14" y="14" width="6" height="6" rx="1" strokeWidth="1.7" />
  </svg>
);


const WalletIcon = () => (
  <svg
    className="profile-menu-icon"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      d="M4 7.5h15.5v11H4v-11Zm0 3h15.5M7 7.5l2-3h7l1.5 3m-2.5 6h3"
    />
  </svg>
);


const OrdersIcon = () => (
  <svg
    className="profile-menu-icon"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      d="M5 5h14v14H5V5Zm3 4h8m-8 4h8m-8 4h5"
    />
  </svg>
);


const BellIcon = () => (
  <svg
    className="profile-menu-icon"
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


const TicketIcon = () => (
  <svg
    className="profile-menu-icon"
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


const StoreIcon = () => (
  <svg
    className="profile-menu-icon"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      d="M4 10h16M5 10l1-5h12l1 5v9H5v-9Zm5 3v6m4-6v6"
    />
  </svg>
);


const ArrowIcon = () => (
  <svg
    className="profile-menu-icon"
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


const CloseIcon = () => (
  <svg
    className="profile-menu-icon"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeWidth="1.8"
      d="m6 6 12 12M18 6 6 18"
    />
  </svg>
);


const LogoutIcon = () => (
  <svg
    className="profile-menu-icon"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M14 8l4 4-4 4M18 12H7m4 8H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"
    />
  </svg>
);


export default function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  const [confirmLogout, setConfirmLogout] = useState(false);

  const [publicId, setPublicId] = useState(null);

  const [sellerStatus, setSellerStatus] = useState(null);

  const [theme, setTheme] = useState(getTheme);

  const navigate = useNavigate();


  const avatarLetter =
    user?.email?.charAt(0).toUpperCase() || 'U';

  const avatarUrl =
    user?.user_metadata?.avatar_url;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Arcus 87';


  useEffect(() => {
    let active = true;


    const loadPublicId = async () => {
      if (!user?.id) {
        setPublicId(null);

        return;
      }


      const [
        { data, error },
        { data: seller },
      ] = await Promise.all([
        supabase.rpc('get_my_public_id'),

        supabase
          .from('seller_profiles')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);


      if (active && !error) {
        setPublicId(data);
      }

      if (active) {
        setSellerStatus(
          seller?.status || null
        );
      }
    };


    loadPublicId();


    return () => {
      active = false;
    };
  }, [user?.id]);


  useEffect(() => {
    const onEscape = (event) => {
      if (event.key !== 'Escape') {
        return;
      }


      if (confirmLogout) {
        setConfirmLogout(false);
      } else {
        setOpen(false);
      }
    };


    document.addEventListener(
      'keydown',
      onEscape
    );


    return () => {
      document.removeEventListener(
        'keydown',
        onEscape
      );
    };
  }, [confirmLogout]);


  useEffect(() => {
    if (!open) {
      return undefined;
    }


    const previousOverflow =
      document.body.style.overflow;


    document.body.style.overflow =
      'hidden';


    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);


  useEffect(() => {
    const syncTheme = (event) => {
      setTheme(
        event.detail?.theme || getTheme()
      );
    };


    window.addEventListener(
      'marketplace-theme-change',
      syncTheme
    );


    return () => {
      window.removeEventListener(
        'marketplace-theme-change',
        syncTheme
      );
    };
  }, []);


  const goTo = (path) => {
    setOpen(false);

    navigate(path);
  };


  return (
    <div className="profile-dropdown">


      {/* PROFILE BUTTON */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open profile menu"
        className="profile-trigger"
      >

        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="profile-trigger-image"
          />
        ) : (
          avatarLetter
        )}


        <span className="profile-online-dot" />

      </button>


      {/* SIDE MENU */}

      {open &&
        createPortal(
          <div className="profile-overlay">


            <button
              type="button"
              onClick={() => setOpen(false)}
              className="profile-backdrop"
              aria-label="Close profile menu"
            />


            <aside
              className="profile-drawer"
              aria-label="Buyer account menu"
            >


              {/* CLOSE */}

              <div className="profile-close-row">

                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="profile-close-button"
                  aria-label="Close profile menu"
                >
                  <CloseIcon />
                </button>

              </div>


              {/* USER */}

              <div className="profile-user-card">

                <span className="profile-user-avatar">

                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                    />
                  ) : (
                    avatarLetter
                  )}

                </span>


                <div className="profile-user-info">

                  <p className="profile-user-name">
                    {displayName}
                  </p>

                  <p className="profile-user-id">
                    ID {publicId || '••••••'}
                  </p>

                </div>

              </div>


              {/* APPEARANCE */}

              <div className="profile-theme-card">

                <div className="profile-theme-header">

                  <p className="profile-section-label">
                    Appearance
                  </p>

                  <span className="profile-theme-hint">
                    Tap to change
                  </span>

                </div>


                <div className="profile-theme-grid">

                  {MARKETPLACE_THEMES.map(
                    (option) => (

                      <button
                        key={option.id}
                        type="button"
                        title={option.label}
                        aria-label={
                          `Use ${option.label} theme`
                        }
                        aria-pressed={
                          theme === option.id
                        }
                        onClick={() =>
                          setTheme(
                            applyTheme(
                              option.id
                            )
                          )
                        }
                        className={
                          theme === option.id
                            ? 'profile-theme-option active'
                            : 'profile-theme-option'
                        }
                      >

                        <span className="profile-theme-colors">

                          {option.colors.map(
                            (color) => (

                              <span
                                key={color}
                                className="profile-theme-color"
                                style={{
                                  backgroundColor:
                                    color,
                                }}
                              />

                            )
                          )}

                        </span>


                        <span className="profile-theme-name">

                          {option.label.replace(
                            'Original ',
                            ''
                          )}

                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>


              {/* ACCOUNT */}

              <p className="profile-account-label">
                Account
              </p>


              <div className="profile-menu-list">


                <button
                  type="button"
                  onClick={() =>
                    goTo('/dashboard')
                  }
                  className="profile-menu-item"
                >

                  <span className="profile-menu-item-icon">
                    <DashboardIcon />
                  </span>

                  <span className="profile-menu-item-text">
                    Dashboard
                  </span>

                  <span className="profile-menu-arrow">
                    <ArrowIcon />
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    goTo('/balance')
                  }
                  className="profile-menu-item"
                >

                  <span className="profile-menu-item-icon">
                    <WalletIcon />
                  </span>

                  <span className="profile-menu-item-text">
                    My balance
                  </span>

                  <span className="profile-menu-arrow">
                    <ArrowIcon />
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    goTo('/my-orders')
                  }
                  className="profile-menu-item"
                >

                  <span className="profile-menu-item-icon">
                    <OrdersIcon />
                  </span>

                  <span className="profile-menu-item-text">
                    My orders
                  </span>

                  <span className="profile-menu-arrow">
                    <ArrowIcon />
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    goTo('/notifications')
                  }
                  className="profile-menu-item"
                >

                  <span className="profile-menu-item-icon">
                    <BellIcon />
                  </span>

                  <span className="profile-menu-item-text">
                    Notifications
                  </span>

                  <span className="profile-menu-arrow">
                    <ArrowIcon />
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    goTo('/seller-chat')
                  }
                  className="profile-menu-item"
                >

                  <span className="profile-menu-item-icon">
                    <TicketIcon />
                  </span>

                  <span className="profile-menu-item-text">
                    Seller chats
                  </span>

                  <span className="profile-menu-arrow">
                    <ArrowIcon />
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    goTo('/support')
                  }
                  className="profile-menu-item"
                >

                  <span className="profile-menu-item-icon">
                    <TicketIcon />
                  </span>

                  <span className="profile-menu-item-text">
                    Ticket
                  </span>

                  <span className="profile-menu-arrow">
                    <ArrowIcon />
                  </span>

                </button>


                {sellerStatus === 'approved' ? (

                  <button
                    type="button"
                    onClick={() =>
                      goTo('/my-products')
                    }
                    className="profile-menu-item"
                  >

                    <span className="profile-menu-item-icon">
                      <StoreIcon />
                    </span>

                    <span className="profile-menu-item-text">
                      My products
                    </span>

                    <span className="profile-menu-arrow">
                      <ArrowIcon />
                    </span>

                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      goTo(
                        '/become-a-seller'
                      )
                    }
                    className="profile-menu-item"
                  >

                    <span className="profile-menu-item-icon">
                      <StoreIcon />
                    </span>

                    <span className="profile-menu-item-text">
                      Become a seller
                    </span>

                    <span className="profile-menu-arrow">
                      <ArrowIcon />
                    </span>

                  </button>

                )}

              </div>


              {/* LOG OUT */}

              <div className="profile-logout-area">

                <button
                  type="button"
                  onClick={() =>
                    setConfirmLogout(true)
                  }
                  className="profile-logout-button"
                >

                  <LogoutIcon />

                  Log out

                </button>

              </div>

            </aside>


            {/* LOGOUT CONFIRMATION */}

            {confirmLogout && (

              <div
                className="profile-confirm-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-title"
              >

                <div className="profile-confirm-box">


                  <div className="profile-confirm-icon">
                    <LogoutIcon />
                  </div>


                  <h2
                    id="logout-title"
                    className="profile-confirm-title"
                  >
                    Log out?
                  </h2>


                  <p className="profile-confirm-text">
                    Are you sure you want to
                    log out of your account?
                  </p>


                  <div className="profile-confirm-actions">

                    <button
                      type="button"
                      onClick={() =>
                        setConfirmLogout(
                          false
                        )
                      }
                      className="profile-confirm-cancel"
                    >
                      No
                    </button>


                    <button
                      type="button"
                      onClick={() => {
                        setConfirmLogout(
                          false
                        );

                        setOpen(false);

                        onLogout();
                      }}
                      className="profile-confirm-yes"
                    >
                      Yes
                    </button>

                  </div>

                </div>

              </div>

            )}

          </div>,
          document.body
        )}

    </div>
  );
}