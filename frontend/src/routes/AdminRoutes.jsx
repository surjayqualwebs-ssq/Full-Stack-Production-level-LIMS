import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import ActivityLogs from '../pages/common/ActivityLogs';
import AdminProfile from '../pages/admin/AdminProfile';

const AdminRoutes = () => {
    return (
        <Route path="/admin" element={<DashboardLayout allowedRoles={['ADMIN']} />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
    );
};

export default AdminRoutes;
