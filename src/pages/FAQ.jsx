import { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: "How fast will I receive the account?",
    answer:
      "The listing states its delivery method and expected timing. Delivery begins only after payment capture and order verification. Open My orders to track delivery and contact support if the stated time passes.",
  },
  {
    question: "What risks apply to account transfers?",
    answer:
      "Many publishers prohibit account sales and may suspend, close or recover a transferred account. Marketplace review cannot override publisher rules or guarantee permanent access. Buy only where the publisher expressly permits transfer.",
  },
  {
    question: "What happens if the account gets banned?",
    answer:
      "Publisher action is a known transfer risk and is not automatically covered. If the seller hid a prior restriction or the listing included a specific protection period, contact support promptly with non-sensitive evidence for review under the Refund Policy.",
  },
  {
    question: "Can I change the email and password after purchase?",
    answer:
      "A listing may allow credential changes, but this does not guarantee ownership, remove recovery risk or create publisher support. Check the written access terms and publisher rules before paying.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Refund eligibility depends on payment, delivery, listing accuracy, evidence, publisher action and mandatory consumer rights. Review the Refund Policy before paying and open a support ticket promptly if something is wrong.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Sign in and open Live Chat & Support from your profile. You can start a private conversation, link it to an order, and see every reply in your Support Centre.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen px-5 pb-20 pt-24 text-zinc-950 sm:px-8 sm:pt-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-9 text-center sm:mb-11">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Help centre</p>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Everything you need to know before buying an account.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/90 shadow-sm backdrop-blur-sm">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-zinc-100 last:border-0"
            >
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 sm:px-6 sm:py-5"
                aria-expanded={openIndex === index}
              >
                <span className="pr-4 text-sm font-bold text-zinc-900 sm:text-base">
                  {faq.question}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openIndex === index && (
                <div className="px-5 pb-5 sm:px-6">
                  <p className="max-w-2xl text-sm leading-6 text-zinc-500">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="mb-4 text-sm text-zinc-500">Still have questions?</p>
          <Link
            to="/support"
            className="inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800"
          >
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
}
