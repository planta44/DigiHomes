import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Home,
  Settings,
  FileText,
  Play
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/houses', label: 'Manage Properties', icon: Building },
    { path: '/admin/featured', label: 'Featured Properties', icon: Settings },
    { path: '/admin/reels', label: 'Digi Reels', icon: Play },
    { path: '/admin/pages', label: 'Manage Pages', icon: FileText },
    { path: '/admin/subscribers', label: 'Subscribers', icon: Users },
    { path: '/admin/settings', label: 'Site Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">DIGI Admin</span>
            </Link>
            <button 
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive(item.path) 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-white font-medium">{user?.name || 'Admin'}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                View Website
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden"></div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-800">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Admin'}
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-4 md:p-6 overflow-x-hidden">
          <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
