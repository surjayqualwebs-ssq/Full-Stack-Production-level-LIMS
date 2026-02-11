import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, LayoutDashboard, FileText, Briefcase, Users, Layout, ChevronDown, Activity } from 'lucide-react';

const DashboardLayout = ({ allowedRoles }) => {
    const { user, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
                    <button onClick={logout} className="text-blue-600 hover:text-blue-800 font-medium">Return to Login</button>
                </div>
            </div>
        );
    }

    const NavItem = ({ to, icon: Icon, children }) => (
        <NavLink
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
            }
        >
            {Icon && <Icon size={20} />}
            <span className="font-medium">{children}</span>
        </NavLink>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
                md:translate-x-0 md:static md:flex-shrink-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white">L</span>
                        </div>
                        LIMS Portal
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-6 px-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Role</p>
                        <div className="bg-slate-800 rounded px-3 py-1 text-sm font-medium text-blue-400 capitalize">
                            {user.role.toLowerCase()}
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {user.role === 'CLIENT' && (
                            <>
                                <NavItem to="/client/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
                                <NavItem to="/client/intakes/new" icon={FileText}>New Intake</NavItem>
                                <NavItem to="/client/intakes" icon={Briefcase}>Intake History</NavItem>
                                <NavItem to="/client/logs" icon={Activity}>Activity Logs</NavItem>
                            </>
                        )}
                        {user.role === 'STAFF' && (
                            <>
                                <NavItem to="/staff/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
                                <NavItem to="/staff/logs" icon={Activity}>Activity Logs</NavItem>
                                {/* <NavItem to="/staff/pending" icon={FileText}>Pending Reviews</NavItem> */}
                            </>
                        )}
                        {user.role === 'LAWYER' && (
                            <>
                                <NavItem to="/lawyer/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
                                <NavItem to="/lawyer/logs" icon={Activity}>Activity Logs</NavItem>
                                {/* <NavItem to="/lawyer/cases" icon={Briefcase}>My Cases</NavItem> */}
                            </>
                        )}
                        {user.role === 'ADMIN' && (
                            <>
                                <NavItem to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
                                <NavItem to="/admin/logs" icon={Activity}>System Logs</NavItem>
                                {/* Admin usually has tabs inside dashboard, but if we had separate pages: */}
                                {/* <NavItem to="/admin/users" icon={Users}>Users</NavItem>
                                <NavItem to="/admin/cases" icon={Briefcase}>All Cases</NavItem> */}
                            </>
                        )}
                    </nav>
                </div>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800 capitalize hidden sm:block">
                            {user.role.toLowerCase()} Dashboard
                        </h1>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 focus:outline-none"
                        >
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-700">{user.name || 'User'}</span>
                                <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                            <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm">
                                {(user.name || user.email || 'U')[0].toUpperCase()}
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* User Dropdown Menu */}
                        {userMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setUserMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-gray-50 sm:hidden">
                                        <p className="text-sm font-semibold text-gray-800">{user.name || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>

                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                // Navigate based on role
                                                if (user.role === 'CLIENT') navigate('/client/profile');
                                                if (user.role === 'STAFF') navigate('/staff/profile');
                                                if (user.role === 'LAWYER') navigate('/lawyer/profile');
                                                if (user.role === 'ADMIN') navigate('/admin/profile');
                                                // Add other roles if they get profile pages later
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <div className="p-1 bg-gray-100 rounded-md text-gray-500">
                                                <Users size={14} />
                                            </div>
                                            View Profile
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                logout();
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <div className="p-1 bg-red-100 rounded-md text-red-500">
                                                <LogOut size={14} />
                                            </div>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
