import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Shield,
  ChevronDown,
  AlertTriangle,
  ExternalLink,
  Settings,
  CheckCircle,
  Package,
  Wrench,
  Award,
  RotateCcw,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminNotifications, markAdminNotificationRead } from '../../services/adminApi';

interface AdminTopbarProps {
  onMobileMenuToggle: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async () => {
    try {
      const res = await getAdminNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || res.notifications.filter((n: any) => !n.isRead).length);
      }
    } catch (err) {
      // Non-blocking notification fetch fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    try {
      if (!notification.isRead) {
        await markAdminNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setIsNotificationOpen(false);
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard Overview';
    if (path.startsWith('/admin/products')) return 'Product Catalog';
    if (path.startsWith('/admin/categories')) return 'Category Management';
    if (path.startsWith('/admin/brands')) return 'Brand Management';
    if (path.startsWith('/admin/inventory/movements')) return 'Stock Movement Ledger';
    if (path.startsWith('/admin/inventory')) return 'Inventory & Stock Control';
    if (path.startsWith('/admin/orders')) return 'Order Management & Fulfillment';
    if (path.startsWith('/admin/returns')) return 'Customer Returns & Refunds';
    if (path.startsWith('/admin/warranty')) return 'Warranty Claims & RMA Management';
    if (path.startsWith('/admin/service')) return 'Electronics Repairs & Service Requests';
    if (path.startsWith('/admin/customers')) return 'Customer Directory';
    if (path.startsWith('/admin/coupons')) return 'Coupons & Promotions';
    if (path.startsWith('/admin/staff')) return 'Staff & Access Control';
    if (path.startsWith('/admin/enquiries')) return 'Customer Enquiries';
    if (path.startsWith('/admin/newsletter')) return 'Newsletter Subscribers';
    if (path.startsWith('/admin/reports')) return 'Business Reports & Analytics';
    if (path.startsWith('/admin/settings')) return 'Showroom Settings';
    return 'Admin Console';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <Link to="/admin" className="hover:text-brand-blue">Console</Link>
            <span>/</span>
            <span className="text-slate-600 capitalize">{getPageTitle()}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog or SKU..."
            className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 border border-transparent focus:border-brand-blue focus:bg-white focus:outline-none transition-all w-52 lg:w-64"
          />
        </form>

        {/* View Storefront Pill */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-blue bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Showroom Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-brand-blue font-semibold">Live Feed</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No new alerts logged. Everything in the showroom is running smoothly!
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !n.isRead;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 transition-colors flex gap-3 cursor-pointer ${
                          isUnread ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            n.type === 'LOW_STOCK'
                              ? 'bg-amber-50 text-amber-600'
                              : n.type === 'WARRANTY'
                              ? 'bg-indigo-50 text-indigo-600'
                              : n.type === 'RETURN'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-blue-50 text-brand-blue'
                          }`}
                        >
                          {n.type === 'LOW_STOCK' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : n.type === 'WARRANTY' ? (
                            <Award className="w-4 h-4" />
                          ) : n.type === 'RETURN' ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </div>
                        <div className="text-xs flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`font-semibold truncate ${isUnread ? 'text-brand-navy' : 'text-slate-800'}`}>
                              {n.title}
                            </p>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
                            )}
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to="/admin/inventory"
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-brand-blue font-semibold hover:underline text-[11px]"
                >
                  Inventory Health
                </Link>
                <Link
                  to="/admin/orders"
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-slate-600 font-semibold hover:underline text-[11px]"
                >
                  Orders Queue
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user?.fullName || 'Staff Member'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {user?.role?.replace(/_/g, ' ') || 'Admin'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-brand-blue border border-blue-200 uppercase">
                  {user?.role?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Showroom Settings
                </Link>
                <Link
                  to="/admin/staff"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Staff Management
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

