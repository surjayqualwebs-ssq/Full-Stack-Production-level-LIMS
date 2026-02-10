import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LawyerDashboard from '../pages/lawyer/Dashboard';
import LawyerCaseDetails from '../pages/lawyer/LawyerCaseDetails';
import LawyerCaseDetails from '../pages/lawyer/LawyerCaseDetails';
import LawyerProfile from '../pages/lawyer/LawyerProfile';
import ActivityLogs from '../pages/common/ActivityLogs';

const LawyerRoutes = () => {
    return (
        <Route path="/lawyer" element={<DashboardLayout allowedRoles={['LAWYER']} />}>
            <Route path="dashboard" element={<LawyerDashboard />} />
            <Route path="cases/:id" element={<LawyerCaseDetails />} />
            <Route path="profile" element={<LawyerProfile />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
    );
};

export default LawyerRoutes;
