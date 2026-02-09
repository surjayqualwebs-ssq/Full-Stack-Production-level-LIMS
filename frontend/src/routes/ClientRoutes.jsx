import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ClientDashboard from '../pages/client/Dashboard';
import NewIntake from '../pages/client/NewIntake';
import ClientIntakeHistory from '../pages/client/ClientIntakeHistory';
import ClientCaseDetails from '../pages/client/ClientCaseDetails';
import RateService from '../pages/client/RateService';
import ClientProfile from '../pages/client/ClientProfile';
import ActivityLogs from '../pages/common/ActivityLogs';

const ClientRoutes = () => {
    return (
        <Route path="/client" element={<DashboardLayout allowedRoles={['CLIENT']} />}>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="intakes/new" element={<NewIntake />} />
            <Route path="intakes" element={<ClientIntakeHistory />} />
            <Route path="cases/:id" element={<ClientCaseDetails />} />
            <Route path="cases/:id/rate" element={<RateService />} />
            <Route path="profile" element={<ClientProfile />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
    );
};

export default ClientRoutes;
