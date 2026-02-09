import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Activity, RotateCcw } from 'lucide-react';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/audit/logs');
            setLogs(res.data);
            setError(null);
        } catch (error) {
            console.error("Failed to fetch logs", error);
            setError("Failed to load activity logs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64 text-gray-500">
            <span className="animate-spin mr-2 w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full" />
            Loading activity history...
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="text-blue-600" />
                        Activity Logs
                    </h1>
                    <p className="text-gray-500">Track your account activity and history.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Refresh Logs"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 italic">
                        No activity logs found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log.id || Math.random()} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                                            {log.action?.replace(/_/g, ' ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded text-xs font-mono">
                                                {log.entity_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={JSON.stringify(log.details, null, 2)}>
                                            {log.details ? JSON.stringify(log.details).substring(0, 50) + (JSON.stringify(log.details).length > 50 ? '...' : '') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(log.created_at || log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
