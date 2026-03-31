import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container-fluid app-container py-5 text-center">
      <h1 className="display-5 fw-bold mb-3">404</h1>
      <p className="lead mb-3">Страница не найдена</p>
      <p className="text-muted mb-4">
        Возможно, вы перешли по неверной ссылке или страница была удалена.
      </p>
      <Link to="/" className="btn btn-primary">
        На главную
      </Link>
    </div>
  );
}

export default NotFound;

