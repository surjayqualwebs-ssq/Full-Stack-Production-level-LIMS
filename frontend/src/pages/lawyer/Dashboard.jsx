import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Briefcase, Calendar, Clock, AlertCircle, CheckCircle, FileText, ChevronRight } from 'lucide-react';

const LawyerDashboard = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await api.get('/lawyer/cases');
                setCases(response.data);
            } catch (err) {
                console.error("Failed to load assigned cases", err);
                setError("Failed to load your assigned cases. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your cases...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Lawyer Dashboard</h1>
                    <p className="text-gray-500">Manage your assigned cases and reviews.</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-medium flex items-center gap-2">
                    <Briefcase size={20} />
                    <span>{cases.length} Active {cases.length === 1 ? 'Case' : 'Cases'}</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                        <FileText size={18} className="text-gray-500" />
                        Assigned Cases
                    </h2>
                </div>

                {cases.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No Cases Assigned</p>
                        <p>You currently do not have any active cases assigned to you.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {cases.map((c) => (
                            <div key={c.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                                            #{c.id}
                                        </span>
                                        <h3 className="font-semibold text-gray-800 text-lg">
                                            {c.case_type?.replace('_', ' ') || 'Unknown Type'}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                                            ${c.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                c.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                        <p><span className="font-medium text-gray-500">Client:</span> {c.client?.clientProfile?.name || c.client?.name || 'Unknown'}</p>
                                        <p><span className="font-medium text-gray-500">Email:</span> {c.client?.user?.email}</p>
                                        <p className="flex items-center gap-1">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="flex items-center gap-1">
                                            <Clock size={14} className="text-gray-400" />
                                            Last Updated: {new Date(c.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* 
                                    Future: Add 'View Details' button when individual case view for Lawyer is implemented.
                                    For now, this is a read-only list as per requirements.
                                */}
                                <div className="hidden md:block">
                                    <button
                                        onClick={() => window.location.href = `/lawyer/cases/${c.id}`}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Manage
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LawyerDashboard;
