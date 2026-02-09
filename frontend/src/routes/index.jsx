import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthRoutes from './AuthRoutes';
import ClientRoutes from './ClientRoutes';
import StaffRoutes from './StaffRoutes';
import LawyerRoutes from './LawyerRoutes';
import AdminRoutes from './AdminRoutes';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Auth Routes */}
            {AuthRoutes()}

            {/* Protected Client Routes */}
            {ClientRoutes()}

            {/* Protected Staff Routes */}
            {StaffRoutes()}

            {/* Protected Lawyer Routes */}
            {LawyerRoutes()}

            {/* Protected Admin Routes */}
            {AdminRoutes()}

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />

            {/* 404 - Redirect to Login (or auth check will handle it) */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
