import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const ClientIntakeHistory = () => {
    const [intakes, setIntakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchIntakes = async () => {
            try {
                const response = await api.get('/client/intakes');
                setIntakes(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch intake history');
            } finally {
                setLoading(false);
            }
        };

        fetchIntakes();
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Intake History</h1>

            {intakes.length === 0 ? (
                <div className="bg-white p-6 rounded shadow text-center">
                    <p className="text-gray-500 mb-4">You haven't submitted any intakes yet.</p>
                    <button
                        onClick={() => navigate('/client/intakes/new')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Submit New Intake
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Description
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {intakes.map((intake) => (
                                <tr key={intake.id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {new Date(intake.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {intake.case_type}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${intake.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                intake.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {intake.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="truncate max-w-xs">{typeof intake.details === 'object' ? intake.details?.description : intake.details}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClientIntakeHistory;
