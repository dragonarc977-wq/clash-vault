import { Link } from 'react-router-dom';

import '../styles/blog.css';


export default function Blog() {
  return (
    <main className="blog-page">

      <section className="blog-card">

        <p className="blog-kicker">
          AllGamersMarket journal
        </p>


        <h1 className="blog-title">
          Blog coming soon.
        </h1>


        <p className="blog-description">
          We’ll publish marketplace
          updates, buyer-safety guides,
          seller standards and
          game-industry news here.
        </p>


        <div className="blog-empty">

          <p className="blog-empty-title">
            No articles published yet
          </p>


          <p className="blog-empty-text">
            New posts will appear on
            this page when they are
            ready.
          </p>

        </div>


        <Link
          to="/"
          className="blog-marketplace-link"
        >
          Explore marketplace
        </Link>

      </section>

    </main>
  );
}