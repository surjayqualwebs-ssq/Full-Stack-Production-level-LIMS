import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { PlusCircle, FileText, Briefcase, Clock, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

const ClientDashboard = () => {
    const [intakes, setIntakes] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const [intakesRes, casesRes] = await Promise.all([
                api.get('/client/intakes'),
                api.get('/client/cases')
            ]);
            setIntakes(intakesRes.data);
            setCases(casesRes.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            if (isRefresh) setRefreshing(false);
            else setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64 text-gray-500">
            <span className="animate-spin mr-2 w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full" />
            Loading your dashboard...
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-500">Track your legal matters and submissions.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-4 py-2.5 rounded-lg border border-gray-200 transition-colors disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                    </button>
                    <Link
                        to="/client/intakes/new"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all font-medium"
                    >
                        <PlusCircle size={20} />
                        New Intake
                    </Link>
                </div>
            </div>

            {/* Active Cases Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase size={22} className="text-blue-600" /> Active Cases
                </h2>
                {cases.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl text-center border border-gray-200 shadow-sm">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase size={32} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Active Cases</h3>
                        <p className="text-gray-500">Once an intake is approved, your active case will appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {cases.map(caseItem => (
                            <div key={caseItem.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="block font-mono text-xs text-gray-500 mb-1 uppercase tracking-wide">Case Number</span>
                                        <span className="font-semibold text-gray-800">{caseItem.case_number}</span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${caseItem.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                                        caseItem.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {caseItem.status}
                                    </span>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">Assigned Lawyer</p>
                                    <div className="font-medium text-gray-800 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            {(caseItem.lawyer?.lawyerProfile?.name || caseItem.lawyer?.name || 'U')[0]}
                                        </div>
                                        {caseItem.lawyer?.lawyerProfile?.name || caseItem.lawyer?.name || 'Pending Assignment'}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">Next Hearing</p>
                                    <div className="font-medium text-gray-800 flex items-center gap-2">
                                        <Clock size={16} className="text-blue-500" />
                                        {caseItem.next_hearing_date
                                            ? new Date(caseItem.next_hearing_date).toLocaleDateString()
                                            : 'Not Scheduled'}
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center text-sm">
                                    <span className="text-gray-400 flex items-center gap-1">
                                        <Clock size={14} /> {new Date(caseItem.start_date || caseItem.createdAt).toLocaleDateString()}
                                    </span>
                                    {caseItem.status === 'CLOSED' && (
                                        <Link to={`/client/cases/${caseItem.id}/rate`} className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                                            Rate Service
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Intakes Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={22} className="text-indigo-600" /> Recent Intakes
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {intakes.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText size={32} className="text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No Intakes Yet</h3>
                            <p className="text-gray-500 mb-6">Start by submitting your first case intake.</p>
                            <Link to="/client/intakes/new" className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                                <PlusCircle size={18} /> Submit New Intake
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Case Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted On</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {intakes.map(intake => (
                                        <tr key={intake.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{intake.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{intake.case_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(intake.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${intake.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    intake.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        intake.status === 'CLARIFICATION_NEEDED' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {intake.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {intake.status === 'CLARIFICATION_NEEDED' ? (
                                                    <Link to={`/client/intakes/${intake.id}/edit`} className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200 hover:bg-yellow-100 transition-colors">
                                                        <AlertTriangle size={14} /> Fix
                                                    </Link>
                                                ) : intake.status === 'REJECTED' ? (
                                                    <span className="flex items-center justify-end gap-1 text-red-500" title="Application Rejected">
                                                        <XCircle size={16} /> Rejected
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 cursor-not-allowed">View</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ClientDashboard;
