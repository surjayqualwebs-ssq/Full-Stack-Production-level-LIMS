import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { ClipboardList, AlertCircle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

const StaffDashboard = () => {
    const [pendingIntakes, setPendingIntakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchPending = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const response = await api.get('/staff/intakes/pending');
            setPendingIntakes(response.data);
            setError(null);
        } catch (error) {
            console.error("Failed to fetch pending intakes", error);
            setError("Failed to load pending intakes. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading pending reviews...</div>;

    return (
        <div>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
                    <p className="text-gray-500">Review and process incoming client intakes.</p>
                </div>
                <button
                    onClick={() => fetchPending(true)}
                    disabled={loading || refreshing}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-4 py-2 rounded-lg shadow-sm hover:shadow transition disabled:opacity-50"
                >
                    <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                        <ClipboardList size={20} className="text-blue-600" />
                        Pending Reviews
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full ml-2">{pendingIntakes.length}</span>
                    </h2>
                </div>

                {pendingIntakes.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                        <p className="text-lg font-medium">All Caught Up!</p>
                        <p>There are no pending intakes requiring review at this time.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempt</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingIntakes.map(intake => (
                                <tr key={intake.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{intake.client?.clientProfile?.name || intake.client?.name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500">{intake.client?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{intake.case_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(intake.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${intake.status === 'CLARIFICATION_NEEDED' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                            }`}>
                                            {intake.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {intake.submission_attempt} / 3
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/staff/intakes/${intake.id}/review`}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded border border-blue-200 hover:bg-blue-100 transition"
                                        >
                                            Review
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
