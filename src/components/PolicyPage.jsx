import { Link } from 'react-router-dom';

import '../styles/policy-page.css';


export default function PolicyPage({
  eyebrow = 'Legal',
  title,
  updated = '15 September 2026',
  summary,
  children,
}) {
  return (
    <main className="policy-page">

      <article className="policy-card">

        <Link
          to="/"
          className="policy-back-link"
        >
          ← Back to marketplace
        </Link>


        <p className="policy-eyebrow">
          {eyebrow}
        </p>


        <h1 className="policy-title">
          {title}
        </h1>


        <p className="policy-updated">
          Effective and last updated:{' '}
          {updated}
        </p>


        {summary && (

          <div className="policy-summary">
            {summary}
          </div>

        )}


        <div className="policy-content">
          {children}
        </div>

      </article>

    </main>
  );
}


export function Section({
  title,
  children,
}) {
  return (
    <section>

      <h2 className="policy-section-title">
        {title}
      </h2>


      <div className="policy-section-content">
        {children}
      </div>

    </section>
  );
}