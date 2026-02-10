import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StaffDashboard from '../pages/staff/Dashboard';
import StaffProfile from '../pages/staff/StaffProfile';
import ReviewIntake from '../pages/staff/ReviewIntake';
import ActivityLogs from '../pages/common/ActivityLogs';

const StaffRoutes = () => {
    return (
        <Route path="/staff" element={<DashboardLayout allowedRoles={['STAFF']} />}>
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="profile" element={<StaffProfile />} />
            <Route path="intakes/:id/review" element={<ReviewIntake />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
    );
};

export default StaffRoutes;
