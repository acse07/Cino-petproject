function Footer() {
  return (
    <footer className="footer py-3 mt-auto bg-black bg-opacity-50">
      <div className="container-fluid app-container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
        <span className="text-muted small">&copy; {new Date().getFullYear()} Cino. Built with TMDB API.</span>
        <span className="text-muted small">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </span>
      </div>
    </footer>
  );
}

export default Footer;

