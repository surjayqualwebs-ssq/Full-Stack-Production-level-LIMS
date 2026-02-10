import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Upload, AlertCircle, CheckCircle, FileText, X, ArrowLeft, Calendar, File } from 'lucide-react';

const NewIntake = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [caseType, setCaseType] = useState('CIVIL');
    const [description, setDescription] = useState('');
    const [incidentDate, setIncidentDate] = useState('');

    // Document State
    const [docName, setDocName] = useState('');
    const [documents, setDocuments] = useState([]); // Array of { id, name }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!docName) {
            setError('Please enter a document name first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', docName);
        formData.append('entity_type', 'INTAKE'); // Initially unlinked, but we can tag it

        setLoading(true);
        try {
            const response = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newDoc = response.data;
            setDocuments([...documents, { id: newDoc.id, name: docName }]);
            setDocName('');
            setLoading(false);
            e.target.value = null; // Reset input
        } catch (err) {
            console.error('Upload failed', err);
            setError('Failed to upload document');
            setLoading(false);
        }
    };

    const handleRemoveDocument = (index) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            setError('Please provide a description of the incident.');
            return;
        }
        if (!incidentDate) {
            setError('Please select the date of the incident.');
            return;
        }

        setLoading(true);
        setError('');

        const payload = {
            caseType,
            details: {
                description,
                incidentDate
            },
            documents
        };

        try {
            await api.post('/client/intakes', payload);
            navigate('/client/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit intake');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/client/dashboard')}
                    className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-1" /> Back to Dashboard
                </button>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">Submit New Intake</h1>
                        <p className="text-blue-100">Please provide details about your case so we can assist you.</p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Case Information Section */}
                            <section>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                    <FileText className="text-blue-500" size={24} />
                                    Case Information
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                                        <div className="relative">
                                            <select
                                                value={caseType}
                                                onChange={(e) => setCaseType(e.target.value)}
                                                className="block w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-shadow appearance-none"
                                            >
                                                <option value="CIVIL">Civil Litigation</option>
                                                <option value="CRIMINAL">Criminal Defense</option>
                                                <option value="FAMILY">Family Law</option>
                                                <option value="CORPORATE">Corporate</option>
                                                <option value="PROPERTY">Real Estate / Property</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description of Incident <span className="text-red-500">*</span></label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={5}
                                            className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow resize-y"
                                            placeholder="Please describe what happened in detail..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Incident <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="text-gray-400" size={18} />
                                            </div>
                                            <input
                                                type="date"
                                                value={incidentDate}
                                                onChange={(e) => setIncidentDate(e.target.value)}
                                                className="block w-full pl-10 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Documents Section */}
                            <section>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                    <Upload className="text-blue-500" size={24} />
                                    Supporting Documents
                                </h2>
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-4">Attach any relevant documents (e.g., police reports, contracts, images).</p>

                                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Police Report"
                                                value={docName}
                                                onChange={(e) => setDocName(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">File Upload</label>
                                            <input
                                                type="file"
                                                onChange={handleFileUpload}
                                                disabled={!docName}
                                                className="w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2.5 file:px-4
                                                    file:rounded-lg file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-blue-50 file:text-blue-700
                                                    hover:file:bg-blue-100 placeholder:block"
                                            />
                                            {!docName && <p className="text-xs text-red-500 mt-1">Please enter a name first.</p>}
                                        </div>
                                    </div>

                                    {documents.length > 0 ? (
                                        <div className="space-y-2">
                                            {documents.map((doc, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <File className="text-blue-500 shrink-0" size={18} />
                                                        <div className="truncate">
                                                            <p className="font-medium text-gray-800 text-sm">{doc.name}</p>
                                                            <p className="text-gray-400 text-xs truncate">ID: {doc.id} - Uploaded</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDocument(idx)}
                                                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                                        title="Remove"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                                            <FileText size={48} className="mx-auto text-gray-300 mb-2" />
                                            <p className="text-sm">No documents added yet</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="pt-6 border-t flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/client/dashboard')}
                                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Intake <CheckCircle size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewIntake;
