export default function Loading() {
  return (
    <main className="page-loading" aria-live="polite" aria-busy="true">
      <div className="page-loading-inner">
        <div className="page-loading-heading">
          <span className="page-loading-mark">AGM</span>
          <div>
            <p className="page-loading-title">Loading marketplace</p>
            <p className="page-loading-subtitle">Preparing the next page…</p>
          </div>
        </div>
        <div className="page-loading-track"><span /></div>
        <div className="page-loading-cards" aria-hidden="true">
          {[0, 1, 2].map((item) => <span key={item} className="page-loading-card" />)}
        </div>
      </div>
    </main>
  );
}
