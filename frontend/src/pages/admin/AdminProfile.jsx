import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { User, Mail, Shield, Save } from 'lucide-react';

const AdminProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [name, setName] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Using the endpoints from the incoming change as they likely match the server
            const response = await api.get('/admin/me');
            setProfile(response.data);
            setName(response.data.name || '');
        } catch (error) {
            console.error("Failed to fetch profile", error);
            setMessage({ type: 'error', text: 'Failed to load profile data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Using the patch endpoint from incoming change
            await api.patch('/admin/me', { name });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Optional: Redirect after success if desired, but user asked for "View Profile" style which usually stays on page
            // The incoming code had a redirect, I will comment it out to match the "View Profile" request unless user wants it.
            // But let's keep the redirect if it was in the "incoming" code as valid logic?
            // User said "Just same as View Profile of another user". ClientProfile doesn't redirect.
            // So I will NOT redirect.
        } catch (error) {
            console.error("Failed to update profile", error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                {/* Using Shield icon from incoming change as it distinguishes Admin, but layout from HEAD */}
                <Shield className="text-purple-600" /> Admin Profile
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 space-y-8">

                    {/* Read-Only Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <Mail size={18} className="text-gray-400" />
                                <span className="font-medium">{profile?.email || profile?.user?.email || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</label>
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <Shield size={18} className="text-purple-600" />
                                <span className="font-medium capitalize">Administrator</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* Editable Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 py-2.5 transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-100 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
