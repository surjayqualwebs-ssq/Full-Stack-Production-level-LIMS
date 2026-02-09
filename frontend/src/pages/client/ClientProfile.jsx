import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { User, Mail, Calendar, Users, Save, Shield } from 'lucide-react';

const ClientProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/client/me');
            setProfile(response.data);
            setDob(response.data.dob || '');
            setGender(response.data.gender || '');
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
            await api.patch('/client/me', { dob, gender });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            fetchProfile(); // Refresh data
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
                <User className="text-blue-600" /> My Profile
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 space-y-8">

                    {/* Read-Only Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <User size={18} className="text-gray-400" />
                                <span className="font-medium">{profile?.name || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <Mail size={18} className="text-gray-400" />
                                <span className="font-medium">{profile?.user?.email || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</label>
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <Shield size={18} className="text-gray-400" />
                                <span className="font-medium capitalize">{profile?.user?.role?.toLowerCase() || 'Client'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* Editable Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        id="dob"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 py-2.5 transition-colors"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Used to calculate age for legal requirements.</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Users size={18} className="text-gray-400" />
                                    </div>
                                    <select
                                        id="gender"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500 py-2.5 transition-colors appearance-none bg-white"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
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
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
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

export default ClientProfile;
