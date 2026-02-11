import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, Activity, Star, Briefcase, DollarSign } from 'lucide-react';

const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...user });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            // Flatten nested profile data for easier editing if needed, or keep structure
            // For now, ensuring we have defaults
            setFormData({
                ...user,
                // Lawyer specific fields might be in user.lawyerProfile or root depending on API
                // Adjust based on where data comes from. 
                // Admin dashboard passes 'user' object from 'GET /admin/users'
                // Let's assume standard structure:
                experience_years: user.experience_years || user.lawyerProfile?.experience_years || '',
                rating: user.rating || user.lawyerProfile?.rating || '',
                consultation_fee: user.consultation_fee || user.lawyerProfile?.consultation_fee || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onSave(formData);
        } catch (err) {
            setError('Failed to save changes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <User className="text-blue-600" /> 
                            Edit User
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Update system access and profile details.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Core Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled // Often email cannot be changed easily
                                        className="pl-10 w-full rounded-lg border-gray-300 border bg-gray-50 text-gray-500 py-2.5 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Status</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Activity size={18} className="text-gray-400" />
                                    </div>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 transition-all appearance-none bg-white"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="BANNED">Banned</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Role</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Shield size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                         type="text"
                                         value={formData.role}
                                         disabled
                                         className="pl-10 w-full rounded-lg border-gray-300 border bg-gray-50 text-gray-500 py-2.5 cursor-not-allowed"
                                    />
                                    {/* Role changing might be restricted or require specific logic */}
                                </div>
                            </div>

                        </div>

                        {/* Lawyer Specifics */}
                        {formData.role === 'LAWYER' && (
                            <>
                                <div className="border-t border-gray-100 my-2"></div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Professional Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Experience (Yrs)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Briefcase size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="experience_years"
                                                min="0"
                                                value={formData.experience_years}
                                                onChange={handleChange}
                                                className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Consultation Fee</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="consultation_fee"
                                                min="0"
                                                value={formData.consultation_fee}
                                                onChange={handleChange}
                                                className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Rating (Overwrite)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Star size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="rating"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={formData.rating}
                                                onChange={handleChange}
                                                className="pl-10 w-full rounded-lg border-gray-300 border focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                    </form>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-200 transition-all"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-user-form"
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
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

            </div>
        </div>
    );
};

export default EditUserModal;
