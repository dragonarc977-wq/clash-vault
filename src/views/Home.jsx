'use client';

import { useState } from 'react';
import { Link } from '../lib/navigation';

import MarketplaceSearch from '../components/MarketplaceSearch';

const games = [
  ['Clash of Clans', 'clash-of-clans'],
  ['Brawl Stars', 'brawl-stars'],
  ['Valorant', 'valorant'],
  ['Clash Royale', 'clash-royale'],
  ['Fortnite', 'fortnite'],
  ['Pokémon GO', 'pokemon-go'],
  ['Mobile Legends', 'mobile-legends'],
  ['Free Fire', 'free-fire'],
];

const faqs = [
  {
    question: 'How fast will I receive the account?',
    answer:
      'Most accounts are delivered within 5–15 minutes after successful payment. In rare cases it can take up to 1 hour. You will receive the account credentials provided by the seller.',
  },
  {
    question: 'What is AllGamersMarket and how does it work?',
    answer:
      'AllGamersMarket is a marketplace that connects buyers with sellers of gaming accounts. Browse available listings, review the account details, choose the one that suits you, and complete your purchase through the platform. Once your order is confirmed, follow the provided delivery instructions and track everything from My Orders. If you need help at any stage, our support team is available to assist.',
  },
  {
    question: 'What happens if the account gets banned?',
    answer:
      'If you experience an issue with the account after delivery, contact our support team as soon as possible and provide your order details. We will review the account details, order information, and available evidence to determine what assistance may be available under our marketplace policies.',
  },
  {
    question: 'Can I change the email and password after purchase?',
    answer:
      'After receiving the login details from the seller, we recommend securing the account as soon as possible by updating the available email, password, and security settings. The credentials you can change may vary by account, so always check the account details before purchasing.',
  },
  {
    question: 'How does account delivery work?',
    answer:
      'After your payment is confirmed, your order will appear in My Orders, where you can securely access the account details provided with your purchase. Review the credentials and account details after delivery. If anything is missing or doesn’t match what you purchased, open a support ticket and link the order so our team can review it.',
  },
  {
    question: 'How can I contact your customer support?',
    answer:
      'Sign in, open your profile menu, and select Ticket. You can start a private conversation, link an order, and view every reply in one place.',
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="home-page">

      {/* HERO */}
      <section className="home-hero">
        <p className="home-hero-label">
          Ultimate games marketplace
        </p>

        <h1 className="home-hero-title">
          Built for the way you play.
        </h1>

        <p className="home-hero-description">
          Accounts, items, top-ups and gaming services. All in one place.
        </p>

        <div className="home-search">
          <MarketplaceSearch />
        </div>
      </section>


      {/* EXPLORE GAMES */}
      <section
        id="games"
        className="games-section"
      >
        <div className="games-heading-container">
          <h2 className="games-heading">
            Explore Games
          </h2>
        </div>

        <div className="games-grid">
          {games.map(([name, image]) => {
            const brightImage =
              image === 'brawl-stars' ||
              image === 'clash-of-clans';

            return (
              <Link
                key={name}
                to={`/game/${image}`}
                className="game-tile"
              >
                <img
                  src={`/games/${image}.png`}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                  className={
                    brightImage
                      ? 'game-tile-image game-tile-image-bright'
                      : 'game-tile-image'
                  }
                />

                <div className="game-tile-overlay" />

                <div className="game-tile-content">
                  <h3 className="game-tile-title">
                    {name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>


      {/* BENEFITS */}
      <section className="home-benefits">
        <div className="home-benefits-grid">

          <div className="home-benefit-card">
            <p className="home-benefit-title">
              Popular Games
            </p>

            <p className="home-benefit-text">
              Deals in popular Games accounts.
            </p>
          </div>

          <div className="home-benefit-card">
            <p className="home-benefit-title">
              Secured Payments
            </p>

            <p className="home-benefit-text">
              A smooth, protected buying experience.
            </p>
          </div>

          <div className="home-benefit-card">
            <p className="home-benefit-title">
              Live Support
            </p>

            <p className="home-benefit-text">
              Helpful for the people when you need an answer.
            </p>
          </div>

        </div>
      </section>


      {/* FAQ */}
      <section className="faq-section">
        <div className="faq-container">

          <div className="faq-header">
            <h2 className="faq-title">
              Have a doubt?
            </h2>

            <p className="faq-subtitle">
              Everything you need to know before placing an order.
            </p>
          </div>


          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="faq-item"
                >
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={isOpen}
                    onClick={() => {
                      setOpenFaq(isOpen ? null : index);
                    }}
                  >
                    <span className="faq-question-text">
                      {faq.question}
                    </span>

                    <svg
                      className={
                        isOpen
                          ? 'faq-icon faq-icon-open'
                          : 'faq-icon'
                      }
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </button>


                  <div
                    className={
                      isOpen
                        ? 'faq-answer-wrapper faq-answer-open'
                        : 'faq-answer-wrapper'
                    }
                  >
                    <div className="faq-answer-inner">
                      <p className="faq-answer">
                        {faq.answer}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

    </main>
  );
}