import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { getCurrentYear } from './utils/helpers';

function App() {
  useEffect(() => {
    // Set footer year
    const yearElements = document.querySelectorAll('.footer-year');
    yearElements.forEach(el => {
      el.textContent = String(getCurrentYear());
    });
  }, []);

  return (
    <div className="page">
      <Outlet />
    </div>
  );
}

export default App;
