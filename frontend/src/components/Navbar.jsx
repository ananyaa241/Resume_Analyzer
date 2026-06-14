import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, History, User, LogOut, FileText } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                ResumeAI
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 transition-colors">
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link to="/history" className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 transition-colors">
                                    <History className="w-4 h-4" />
                                    <span>History</span>
                                </Link>
                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                                        {user.fullName}
                                    </span>
                                    <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium">Login</Link>
                                <Link to="/register" className="btn-primary">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
