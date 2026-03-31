function Loader({ count = 8 }) {
  const items = Array.from({ length: count });

  return (
    <div className="row g-3 g-md-4">
      {items.map((_, index) => (
        <div key={index} className="col-6 col-sm-4 col-md-3">
          <div className="movie-card p-2 skeleton skeleton-rounded">
            <div className="ratio ratio-2x3 mb-2" />
            <div className="skeleton skeleton-rounded mb-2" style={{ height: '0.9rem' }} />
            <div className="skeleton skeleton-rounded" style={{ height: '0.9rem', width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Loader;

