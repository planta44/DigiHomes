import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Public Pages
import HomePage from './pages/HomePage';
import HousesPage from './pages/HousesPage';
import HouseDetailsPage from './pages/HouseDetailsPage';
import ContactPage from './pages/ContactPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ServicesPage from './pages/ServicesPage';
import BuyPage from './pages/BuyPage';
import RentPage from './pages/RentPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageHouses from './pages/admin/ManageHouses';
import AddEditHouse from './pages/admin/AddEditHouse';
import Subscribers from './pages/admin/Subscribers';
import SiteSettings from './pages/admin/SiteSettings';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/houses/:id" element={<HouseDetailsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/rent" element={<RentPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/houses" element={
            <ProtectedRoute>
              <ManageHouses />
            </ProtectedRoute>
          } />
          <Route path="/admin/houses/new" element={
            <ProtectedRoute>
              <AddEditHouse />
            </ProtectedRoute>
          } />
          <Route path="/admin/houses/edit/:id" element={
            <ProtectedRoute>
              <AddEditHouse />
            </ProtectedRoute>
          } />
          <Route path="/admin/subscribers" element={
            <ProtectedRoute>
              <Subscribers />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <SiteSettings />
            </ProtectedRoute>
          } />
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
