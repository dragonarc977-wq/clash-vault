import { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: "How fast will I receive the account?",
    answer:
      "Most accounts are delivered within 5–15 minutes after successful payment. In rare cases it can take up to 1 hour. You will receive the login details instantly on the website and also via email.",
  },
  {
    question: "Is it safe to buy accounts from Clash Vault?",
    answer:
      "Yes. Every account is carefully verified before listing. We only sell accounts with clean history and no active bans. Payments are processed securely through Razorpay.",
  },
  {
    question: "What happens if the account gets banned?",
    answer:
      "We offer a replacement guarantee if the account is banned due to previous owner activity within the warranty period (usually 7–30 days depending on the account). Contact support immediately with proof and we will help you.",
  },
  {
    question: "Can I change the email and password after purchase?",
    answer:
      "Yes, and we strongly recommend doing so immediately after receiving the account for maximum security.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Refunds are only possible if the account credentials are incorrect or the account is not as described. Once the account is delivered and working, refunds are not available (standard marketplace policy).",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can use the live chat button on the bottom right of the website anytime. We also respond quickly to emails. Our support is available 24/7.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Frequently Asked <span className="text-yellow-400">Questions</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Everything you need to know before buying an account.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-white pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-yellow-400 flex-shrink-0 transition-transform duration-200 ${
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
                <div className="px-6 pb-5">
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-zinc-400 mb-6">Still have questions?</p>
          <Link
            to="/shop"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold py-3.5 px-8 rounded-xl transition-all"
          >
            Browse Accounts
          </Link>
        </div>
      </div>
    </div>
  );
}