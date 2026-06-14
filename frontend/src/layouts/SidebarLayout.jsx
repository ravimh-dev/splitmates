import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  CheckCircle,
} from "lucide-react";

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Settlements", href: "/settlements", icon: CreditCard },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 space-x-2">
            <img src="/header-icon.svg" alt="SplitMates" className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">SplitMates</span>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-slate-100 text-black"
                      : "text-slate-600 hover:bg-slate-50 hover:text-black"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? "text-black"
                        : "text-slate-400 group-hover:text-black"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Summary at the bottom */}
        <div className="flex-shrink-0 flex border-t border-slate-200 p-4 bg-white">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-black font-semibold border border-slate-200 text-sm overflow-hidden">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400 line-clamp-1">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile (Drawer overlay) */}
      <div
        className={`md:hidden fixed inset-0 z-40 flex ${isSidebarOpen ? "visible" : "pointer-events-none invisible"}`}
      >
        {/* Backdrop overlay */}
        <div
          className={`fixed inset-0 bg-slate-900 bg-opacity-30 transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={toggleSidebar}
        />

        {/* Mobile menu panel */}
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200 transform transition duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-4">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-slate-900 text-white"
              onClick={toggleSidebar}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 space-x-2">
              <img
                src="/header-icon.svg"
                alt="SplitMates"
                className="h-8 w-8"
              />
              <span className="text-xl font-bold tracking-tight">
                SplitMates
              </span>
            </div>
            <nav className="mt-8 px-4 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={toggleSidebar}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                      isActive
                        ? "bg-slate-100 text-black"
                        : "text-slate-600 hover:bg-slate-50 hover:text-black"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 text-slate-400" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-black font-semibold border border-slate-200 text-sm overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:pl-64 min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-slate-200">
          <button
            type="button"
            className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between">
            {/* Search Placeholder */}
            <div className="flex-1 flex items-center">
              <div className="w-full max-w-xs relative text-slate-400 focus-within:text-slate-600">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search groups, bills, settlements... (Ctrl+K)"
                  disabled
                  className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-0 transition-colors cursor-not-allowed"
                />
              </div>
            </div>

            {/* Top Bar Actions */}
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notification Placeholder */}
              <button
                type="button"
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-500 hover:bg-slate-50 transition-all cursor-not-allowed"
                disabled
                title="Notifications (Placeholder)"
              >
                <Bell className="h-5 w-5" />
              </button>

              {/* User Avatar Info */}
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
                <span className="hidden lg:inline text-sm font-medium text-slate-700">
                  {user?.name}
                </span>
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 py-8 px-4 sm:px-6 md:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
