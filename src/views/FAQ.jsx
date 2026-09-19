'use client';

import {
  useState,
} from 'react';

import {
  Link,
} from '../lib/navigation';



const faqs = [
  {
    question:
      'How fast will I receive the account?',

    answer:
      'The listing states its delivery method and expected timing. Delivery begins only after payment capture and order verification. Open My orders to track delivery and contact support if the stated time passes.',
  },

  {
    question:
      'What risks apply to account transfers?',

    answer:
      'Many publishers prohibit account sales and may suspend, close or recover a transferred account. Marketplace review cannot override publisher rules or guarantee permanent access. Buy only where the publisher expressly permits transfer.',
  },

  {
    question:
      'What happens if the account gets banned?',

    answer:
      'Publisher action is a known transfer risk and is not automatically covered. If the seller hid a prior restriction or the listing included a specific protection period, contact support promptly with non-sensitive evidence for review under the Refund Policy.',
  },

  {
    question:
      'Can I change the email and password after purchase?',

    answer:
      'A listing may allow credential changes, but this does not guarantee ownership, remove recovery risk or create publisher support. Check the written access terms and publisher rules before paying.',
  },

  {
    question:
      'Do you offer refunds?',

    answer:
      'Refund eligibility depends on payment, delivery, listing accuracy, evidence, publisher action and mandatory consumer rights. Review the Refund Policy before paying and open a support ticket promptly if something is wrong.',
  },

  {
    question:
      'How do I contact support?',

    answer:
      'Sign in and open Live Chat & Support from your profile. You can start a private conversation, link it to an order, and see every reply in your Support Centre.',
  },
];


export default function FAQ() {
  const [
    openIndex,
    setOpenIndex,
  ] = useState(null);


  const toggle = (
    index
  ) => {
    setOpenIndex(
      openIndex === index
        ? null
        : index
    );
  };


  return (
    <main className="faq-page">

      <div className="faq-container">


        {/* HEADER */}

        <div className="faq-header">

          <p className="faq-kicker">
            Help centre
          </p>


          <h1 className="faq-title">
            FAQ
          </h1>


          <p className="faq-subtitle">
            Everything you need to know
            before buying an account.
          </p>

        </div>


        {/* FAQ LIST */}

        <div className="faq-list">

          {faqs.map(
            (
              faq,
              index
            ) => {
              const isOpen =
                openIndex ===
                index;


              return (
                <div
                  key={
                    faq.question
                  }
                  className="faq-item"
                >

                  <button
                    type="button"
                    onClick={() =>
                      toggle(
                        index
                      )
                    }
                    className="faq-question"
                    aria-expanded={
                      isOpen
                    }
                  >

                    <span className="faq-question-text">
                      {faq.question}
                    </span>


                    <svg
                      className={
                        isOpen
                          ? 'faq-chevron faq-chevron-open'
                          : 'faq-chevron'
                      }
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>

                  </button>


                  {isOpen && (

                    <div className="faq-answer">

                      <p className="faq-answer-text">
                        {faq.answer}
                      </p>

                    </div>

                  )}

                </div>
              );
            }
          )}

        </div>


        {/* SUPPORT */}

        <div className="faq-support">

          <p className="faq-support-text">
            Still have questions?
          </p>


          <Link
            to="/support"
            className="faq-support-link"
          >
            Contact support
          </Link>

        </div>

      </div>

    </main>
  );
}