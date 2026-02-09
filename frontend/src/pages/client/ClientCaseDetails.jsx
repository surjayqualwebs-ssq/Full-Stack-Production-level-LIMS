import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ClientCaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCaseDetails = async () => {
            try {
                const response = await api.get(`/client/cases`);
                // Similar filtering as with Lawyer, ideally fetch by ID from API
                const myCase = response.data.find(c => c.id === parseInt(id));

                if (myCase) {
                    setCaseData(myCase);
                } else {
                    setError('Case not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch case details');
            } finally {
                setLoading(false);
            }
        };

        fetchCaseDetails();
    }, [id]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!caseData) return <div className="p-6">Case not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button onClick={() => navigate('/client/dashboard')} className="mb-4 text-blue-500 hover:underline">
                &larr; Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold mb-6">Case Details: {caseData.case_number}</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Status Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-gray-600 text-sm">Current Status</p>
                        <span className={`px-2 py-1 rounded-full text-sm font-semibold 
                            ${caseData.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                caseData.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'}`}>
                            {caseData.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Next Hearing Date</p>
                        <p className="text-lg font-bold text-blue-600">
                            {caseData.next_hearing_date ? new Date(caseData.next_hearing_date).toLocaleDateString() : 'Not Scheduled'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Case Info</h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-gray-600 text-sm">Assigned Lawyer</p>
                        <p className="font-medium">{caseData.lawyer?.lawyerProfile?.name || caseData.lawyer?.email || 'Unassigned'}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Case Type</p>
                        <p className="font-medium">{caseData.case_type}</p>
                    </div>

                    {caseData.notes && (
                        <div>
                            <p className="text-gray-600 text-sm">Notes from Lawyer</p>
                            <p className="bg-yellow-50 p-3 rounded border border-yellow-200 text-gray-700 mt-1">
                                {caseData.notes}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientCaseDetails;
