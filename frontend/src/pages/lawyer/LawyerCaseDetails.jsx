import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const LawyerCaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [nextHearingDate, setNextHearingDate] = useState('');
    const [notes, setNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchCaseDetails();
    }, [id]);

    const fetchCaseDetails = async () => {
        try {
            const response = await api.get(`/lawyer/cases`);
            // filtering client side for now as the getMyCases returns all cases for the lawyer
            // ideally we should have a getCaseById endpoint, but we can reuse the list for now or add a specific endpoint if needed
            // Wait, I should probably add a getCaseById specific endpoint in the future for efficiency, but for now I'll filter.
            const myCase = response.data.find(c => c.id === parseInt(id));

            if (myCase) {
                setCaseData(myCase);
                setStatus(myCase.status);
                setNextHearingDate(myCase.next_hearing_date ? myCase.next_hearing_date.split('T')[0] : '');
                setNotes(myCase.notes || '');
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

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        try {
            await api.patch(`/lawyer/cases/${id}`, {
                status,
                next_hearing_date: nextHearingDate || null,
                notes
            });
            alert('Case updated successfully!');
            fetchCaseDetails(); // Refresh data
        } catch (err) {
            console.error(err);
            setError('Failed to update case');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!caseData) return <div className="p-6">Case not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button onClick={() => navigate('/lawyer/dashboard')} className="mb-4 text-blue-500 hover:underline">
                &larr; Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold mb-6">Manage Case: {caseData.case_number}</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Case Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600">Client:</p>
                        <p className="font-medium">{caseData.client?.clientProfile?.name || caseData.client?.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Type:</p>
                        <p className="font-medium">{caseData.case_type}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Current Status:</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                            ${caseData.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                caseData.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'}`}>
                            {caseData.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Update Details</h2>
                <form onSubmit={handleUpdate}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="OPEN">OPEN</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="ON_HOLD">ON_HOLD</option>
                            <option value="CLOSED">CLOSED</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Next Hearing Date</label>
                        <input
                            type="date"
                            value={nextHearingDate}
                            onChange={(e) => setNextHearingDate(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="4"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={updating}
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {updating ? 'Updating...' : 'Update Case'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LawyerCaseDetails;
