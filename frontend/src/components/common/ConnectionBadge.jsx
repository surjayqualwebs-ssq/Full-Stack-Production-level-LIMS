import React from 'react';
import { useSocket } from '../../context/SocketContext';

const ConnectionBadge = () => {
    const socket = useSocket();

    return (
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${socket ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${socket ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {socket ? 'Connected' : 'Disconnected'}
        </span>
    );
};

export default ConnectionBadge;
