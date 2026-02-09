import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

const AuthRoutes = () => {
    return (
        <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route index element={<Navigate to="login" replace />} />
        </Route>
    );
};

export default AuthRoutes;
