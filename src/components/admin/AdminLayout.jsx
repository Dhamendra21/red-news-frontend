"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from "@/store/slice/authSlice";
import {
  LayoutDashboard, BarChart3, Newspaper, SquarePen, Inbox,
  Megaphone, Users, LogOut, Link as LinkIcon, FolderTree,
  Film, Image as ImageIcon, Calendar as CalendarIcon, FileText,
  Menu, X, ChevronLeft, ChevronRight, Home
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} />, exact: true },
  { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={20} />, badge: 'नया' },
  { path: '/admin/news', label: 'News', icon: <Newspaper size={20} /> },
  { path: '/admin/news/create', label: 'Create News', icon: <SquarePen size={20} /> },
  { path: '/admin/gallery', label: 'Media Gallery', icon: <ImageIcon size={20} /> },
  { path: '/admin/comments', label: 'Comments', icon: <Inbox size={20} /> },
  { path: '/admin/ads', label: 'Ads', icon: <Megaphone size={20} /> },
  { path: '/admin/reader-submissions', label: 'Submissions', icon: <FolderTree size={20} /> },
  { path: '/admin/web-stories', label: 'Web Stories', icon: <Film size={20} /> },
  { path: '/admin/polls', label: 'Daily Poll', icon: <BarChart3 size={20} /> },
  { path: '/admin/tracker', label: 'Work Tracker', icon: <CalendarIcon size={20} /> },
  { path: '/admin/billing', label: 'Billing', icon: <FileText size={20} /> },
  { path: '/admin/users', label: 'Users', icon: <Users size={20} />, adminOnly: true },
];

// Bottom nav — 5 most important items for mobile
const BOTTOM_NAV = [
  { path: '/admin', label: 'Home', icon: <LayoutDashboard size={22} />, exact: true },
  { path: '/admin/news', label: 'News', icon: <Newspaper size={22} /> },
  { path: '/admin/news/create', label: 'Create', icon: <SquarePen size={22} /> },
  { path: '/admin/ads', label: 'Ads', icon: <Megaphone size={22} /> },
  { path: '/admin/gallery', label: 'Gallery', icon: <ImageIcon size={22} /> },
];

export default function AdminLayout({ children }) {
  // Desktop: sidebar open/collapsed
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Mobile: drawer open/closed
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector(state => state?.auth || {});
  const drawerRef = useRef(null);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [drawerOpen]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isActive = (item) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path) && item.path !== '/admin';

  // Shared nav link component
  const NavLink = ({ item, collapsed }) => {
    const active = isActive(item);
    return (
      <Link
        href={item.path}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-150
          ${active
            ? 'bg-slate-800 text-white border-l-4 border-red-500 font-semibold'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-l-4 border-transparent'
          }`}
      >
        <span className={`flex-shrink-0 ${active ? 'text-red-400' : ''}`}>{item.icon}</span>
        {!collapsed && (
          <>
            <span className="text-sm flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-600/30 px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex print:bg-white">

      {/* ══════════════════════════════════════════════════════
          DESKTOP SIDEBAR (hidden on mobile)
      ══════════════════════════════════════════════════════ */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 bg-slate-900 text-white transition-all duration-300 print:hidden
          ${sidebarOpen ? 'w-64' : 'w-16'}`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 min-h-[60px]">
          <div className="w-8 h-8 flex-shrink-0">
            <img src="/logo.webp" alt="RED NEWS" className="w-full h-full object-contain" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm tracking-wide text-white truncate">RED NEWS BHARAT</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Admin Portal</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {NAV_ITEMS.map(item => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            return <NavLink key={item.path} item={item} collapsed={!sidebarOpen} />;
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-slate-800">
          {sidebarOpen && (
            <div className="mb-2 px-2">
              <p className="text-xs text-slate-300 font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm px-2 py-1.5 w-full rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════
          MOBILE DRAWER OVERLAY
      ══════════════════════════════════════════════════════ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" aria-hidden="true" />
      )}

      {/* Mobile Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white z-50 flex flex-col
          transform transition-transform duration-300 md:hidden print:hidden
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between min-h-[60px]">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="RED NEWS" className="w-8 h-8 object-contain" />
            <div>
              <p className="font-bold text-sm text-white">RED NEWS BHARAT</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            return <NavLink key={item.path} item={item} collapsed={false} />;
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-sm text-white font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 uppercase">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-slate-400 hover:text-red-400 text-sm px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 print:overflow-visible">

        {/* Top Header */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between flex-shrink-0 print:hidden min-h-[56px]">
          {/* Left: hamburger (mobile) + collapse (desktop) */}
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {/* Desktop collapse */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>

            {/* Page title from current route */}
            <span className="font-semibold text-gray-800 text-sm md:text-base truncate max-w-[160px] sm:max-w-none">
              {NAV_ITEMS.find(i => i.exact ? pathname === i.path : pathname.startsWith(i.path) && i.path !== '/admin')?.label || 'Dashboard'}
            </span>
          </div>

          {/* Right: quick links + avatar */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex text-sm text-red-600 hover:text-red-700 font-medium items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              <Home size={15} />
              <span className="hidden md:inline">Live Site</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="hidden sm:flex text-sm text-slate-600 hover:text-slate-900 font-medium items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              <BarChart3 size={15} />
              <span className="hidden md:inline">Analytics</span>
            </Link>
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 print:overflow-visible">
          {/* Extra bottom padding on mobile for the bottom nav bar */}
          <div className="p-3 sm:p-4 md:p-6 pb-24 md:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE BOTTOM NAV BAR (visible only on mobile)
      ══════════════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-30 md:hidden print:hidden">
        <div className="flex items-stretch h-16">
          {BOTTOM_NAV.map(item => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors
                  ${active ? 'text-red-400' : 'text-slate-400 hover:text-white'}`}
              >
                <span className={`transition-transform duration-150 ${active ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className="truncate w-full text-center px-1">{item.label}</span>
                {active && <span className="absolute bottom-0 w-8 h-0.5 bg-red-500 rounded-full" />}
              </Link>
            );
          })}
          {/* More button opens drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-slate-400 hover:text-white transition-colors"
          >
            <Menu size={22} />
            <span>More</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
