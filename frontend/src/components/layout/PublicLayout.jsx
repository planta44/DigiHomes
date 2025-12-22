import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Add padding for fixed navbar - except on homepage where it overlays the hero */}
      <main className={`flex-grow ${isHomePage ? '' : 'pt-16'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
