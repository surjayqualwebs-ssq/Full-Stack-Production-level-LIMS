
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, token } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        // Only connect if we have a token and user
        console.log('SocketContext: Checking auth for connection...', { hasToken: !!token, userEmail: user?.email });
        if (token && user) {
            console.log('SocketContext: Attempting connection...');
            // Connect to backend
            // Connect to backend (defaults to window.location.origin)
            const SOCKET_URL = import.meta.env.VITE_API_URL || undefined;
            const newSocket = io(SOCKET_URL, {
                auth: { token },
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
            });

            // Global Listeners based on Role (optional, for toasts)
            // We can also listen in specific components
            if (user.role === 'LAWYER') {
                newSocket.on('case:assigned', (data) => {
                    addToast(`New Case Assigned: ${data.case_number}`, 'success');
                });
            }

            if (user.role === 'CLIENT') {
                newSocket.on('intake:updated', (data) => {
                    addToast(`Your Intake status updated to: ${data.status}`, 'info');
                });
            }

            if (user.role === 'STAFF' || user.role === 'ADMIN') {
                newSocket.on('dashboard:intake-added', (data) => {
                    addToast(`New Intake Submitted by ${data.client?.email || 'User'}`, 'info');
                });
            }

            setSocket(newSocket);

            // Cleanup
            return () => {
                newSocket.off('case:assigned');
                newSocket.off('intake:updated');
                newSocket.off('dashboard:intake-added');
                newSocket.disconnect();
            };
        } else {
            // If logged out, disconnect
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [token, user]); // Re-connect if token changes (login/logout)

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
