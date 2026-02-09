import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    // If already logged in, redirect to respective dashboard
    if (user) {
        if (user.role === 'CLIENT') return <Navigate to="/client/dashboard" replace />;
        if (user.role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
        if (user.role === 'LAWYER') return <Navigate to="/lawyer/dashboard" replace />;
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Legal Intake System
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
