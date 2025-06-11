import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen matchwork-gradient-bg flex items-center justify-center">
      <div className="text-center matchwork-card p-8 shadow-xl">
        <h1 className="text-4xl font-bold mb-4 text-matchwork-primary">404</h1>
        <p className="text-xl matchwork-text-muted mb-4">Упс! Страница не найдена</p>
        <a href="/" className="text-matchwork-primary hover:underline font-medium">
          Вернуться на главную
        </a>
      </div>
    </div>
  );
};

export default NotFound;
