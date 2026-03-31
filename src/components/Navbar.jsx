import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useDebounce from '../hooks/useDebounce.js';

function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  // Единственный эффект — навигация по debounced query
  useState(() => {}, []);
  
  const handleSearch = (value) => {
    setQuery(value);
    if (value.trim()) {
      // debounce обработает навигацию
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar border-bottom border-dark sticky-top">
      <div className="container-fluid app-container">
        <Link className="navbar-brand text-primary-emphasis" to="/">
          CINO
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link">
                Главная
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/favorites" className="nav-link">
                Избранное
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/anime" className="nav-link">
                Аниме
              </NavLink>
            </li>
          </ul>
          <div className="d-flex ms-lg-3">
            <input
              className="form-control search-input"
              type="search"
              placeholder="Поиск фильмов, сериалов..."
              aria-label="Поиск по каталогу"
              value={query}
              onChange={e => {
                const val = e.target.value;
                setQuery(val);
                if (val.trim()) {
                  navigate(`/?q=${encodeURIComponent(val.trim())}`, { replace: true });
                } else {
                  navigate('/', { replace: true });
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;