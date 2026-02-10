import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { CheckCircle, FileText, ArrowLeft, ExternalLink, XCircle } from 'lucide-react';

const ReviewIntake = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [intake, setIntake] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Action State
    const [note, setNote] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        const fetchIntake = async () => {
            try {
                // Currently fetching via client endpoint if staff also has access, 
                // BUT better to have a specific staff endpoint for single intake details 
                // or just rely on the fact that if we have ID we might be able to fetch it.
                // Looking at routes, we don't have a specific `GET /api/staff/intakes/:id`? 
                // We might need to use `GET /api/client/intakes/:id` but that might be blocked for staff.
                // CHECK api_endpoints.md -> It lists `GET /api/staff/intakes/pending`.
                // It does NOT explicitly list `GET /api/staff/intakes/:id`.
                // However, let's assume `GET /api/client/intakes/:id` might check ownership.
                // WAIT, I should probably check if I implemented a global getter or if I need to add one.
                // Checking `StaffController` -> NO generic get by ID.
                // WORKAROUND: For now, I'll filter it from the pending list if I can't fetch it, 
                // OR (better) I'll assume I can just use the verify endpoint's response or something?
                // Actually, let's try to add a `GET /api/staff/intakes/:id` quickly OR 
                // utilize the `reviewIntake` endpoint to just get data? No.

                // Let's rely on `GET /api/staff/intakes/pending` for the list, 
                // but we need DETAILS here. 
                // HACK: I will fetch ALL pending again and find this one. Not efficient but works for now.
                const response = await api.get('/staff/intakes/pending');
                const found = response.data.find(i => i.id === parseInt(id));
                if (found) setIntake(found);
                else throw new Error("Intake not found in pending list");

            } catch (error) {
                console.error("Failed to fetch intake details", error);
                alert("Could not load intake details. It might have been processed already.");
                navigate('/staff/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchIntake();
    }, [id, navigate]);

    const handleAction = async (actionType, payload = {}) => {
        if (!window.confirm(`Are you sure you want to ${actionType}?`)) return;
        setActionLoading(true);
        try {
            await api.post(`/staff/intakes/${id}/review`, {
                action: actionType,
                ...payload
            });
            alert("Action successful!");
            navigate('/staff/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewName, setPreviewName] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);

    const handleViewDocument = async (docUrl, filename) => {
        if (!docUrl) {
            alert("Error: Document URL is missing.");
            return;
        }

        setPreviewLoading(true);
        setPreviewName(filename);

        try {
            // Strip '/api' prefix as axios instance adds it
            const url = docUrl.startsWith('/api') ? docUrl.substring(4) : docUrl;

            const response = await api.get(url, { responseType: 'blob' });

            // Create Blob URL
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const blobUrl = window.URL.createObjectURL(blob);

            setPreviewUrl(blobUrl);
        } catch (error) {
            console.error("Failed to download document", error);
            const status = error.response?.status;
            const msg = error.response?.data?.message || error.message;
            alert(`Failed to view document: ${status || ''} ${msg}`);
            setPreviewUrl(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    const closePreview = () => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setPreviewLoading(false);
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!intake) return <div className="p-8">Intake not found.</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate('/staff/dashboard')} className="flex items-center text-gray-500 hover:text-gray-800 mb-6">
                <ArrowLeft size={20} className="mr-1" /> Back to Dashboard
            </button>

            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Review Intake #{intake.id}</h1>
                    <div className="flex gap-4 text-sm text-gray-600">
                        <span><strong>Client:</strong> {intake.client?.name}</span>
                        <span><strong>Submitted:</strong> {new Date(intake.createdAt).toLocaleString()}</span>
                        <span><strong>Attempt:</strong> {intake.attempts}/3</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        {intake.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Details Column */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Case Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-400">Case Type</label>
                                <p className="text-gray-800 font-medium">{intake.case_type}</p>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400">Description</label>
                                <p className="text-gray-800 whitespace-pre-wrap">{intake.details?.description || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400">Incident Date</label>
                                <p className="text-gray-800">{intake.details?.incidentDate || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Documents</h2>
                        {!intake.documents || intake.documents.length === 0 ? (
                            <p className="text-gray-500 italic">No documents attached.</p>
                        ) : (
                            <ul className="space-y-3">
                                {intake.documents.map((doc, idx) => (
                                    <li key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <FileText size={20} className="text-blue-500" />
                                            <span className="font-medium text-gray-700">{doc.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleViewDocument(doc.url, doc.name)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm hover:underline"
                                        >
                                            View <ExternalLink size={14} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-4 pt-4 border-t flex justify-end">
                            {intake.documents_verified ? (
                                <span className="text-green-600 flex items-center gap-2 font-medium">
                                    <CheckCircle size={18} /> Documents Verified
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleAction('VERIFY_DOCS')}
                                    disabled={actionLoading}
                                    className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition"
                                >
                                    Mark Documents as Verified
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Column */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">Decision</h2>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleAction('APPROVE')}
                                disabled={actionLoading || !intake.documents_verified}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!intake.documents_verified ? "Verify documents first" : ""}
                            >
                                Approve Intake
                            </button>
                            {!intake.documents_verified && (
                                <p className="text-xs text-center text-amber-600">
                                    * Verify documents to enable approval
                                </p>
                            )}

                            <hr className="my-4" />

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Request Clarification</label>
                                <button
                                    onClick={() => handleAction('UPDATE_STATUS', { status: 'CLARIFICATION_NEEDED' })}
                                    disabled={actionLoading}
                                    className="w-full bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 py-2 rounded-lg font-medium text-sm"
                                >
                                    Request More Info
                                </button>
                            </div>

                            <hr className="my-4" />

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Reject Application</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded p-2 text-sm mb-2"
                                    placeholder="Reason for rejection..."
                                    rows={2}
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                />
                                <button
                                    onClick={() => handleAction('REJECT', { reason: rejectionReason })}
                                    disabled={actionLoading || !rejectionReason}
                                    className="w-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-2">Internal Notes</h2>
                        <textarea
                            className="w-full border border-gray-300 rounded p-2 text-sm mb-2"
                            placeholder="Add a private note..."
                            rows={3}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                        <button
                            onClick={() => {
                                handleAction('ADD_NOTE', { note });
                                setNote('');
                            }}
                            disabled={actionLoading || !note}
                            className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 rounded font-medium text-sm"
                        >
                            Add Note
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview Modal */}
            {(previewUrl || previewLoading) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FileText size={18} className="text-blue-600" />
                                {previewName}
                            </h3>
                            <button
                                onClick={closePreview}
                                className="text-gray-500 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 p-1 relative">
                            {previewLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                                        <p className="text-gray-500 font-medium">Loading document...</p>
                                    </div>
                                </div>
                            ) : (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full rounded border bg-white"
                                    title="Document Preview"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewIntake;
