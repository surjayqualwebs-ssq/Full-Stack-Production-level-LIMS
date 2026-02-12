import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import { Users, FileText, Activity, Shield, LogOut, Plus, Search, Edit } from 'lucide-react';
import EditUserModal from '../../components/admin/EditUserModal';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, cases: 0 });
    const [users, setUsers] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, cases, logs

    // New User Form State
    const [showUserForm, setShowUserForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STAFF', department: '', case_types: [], experience_years: '', rating: '', rating_count: '', consultation_fee: '' });

    // Logs State
    const [logs, setLogs] = useState([]);

    // Edit User State
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const toast = useToast();
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, casesRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/cases')
            ]);
            setUsers(usersRes.data);
            setCases(casesRes.data);
            setStats({
                users: usersRes.data.length,
                cases: casesRes.data.length
            });
        } catch (error) {
            console.error("Failed to load admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get('/audit/logs');
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        try {
            await api.post('/admin/users', newUser);
            setFormSuccess('User created successfully!');
            setNewUser({ name: '', email: '', password: '', role: 'STAFF', department: '', case_types: [], experience_years: '', rating: '', rating_count: '', consultation_fee: '' });
            fetchData(); // Refresh list
            setTimeout(() => setShowUserForm(false), 2000);
        } catch (error) {
            setFormError(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleEditUser = (user) => {
        setEditingUser({ ...user }); // Clone user object
        setShowEditModal(true);
    };



    if (loading) return <div className="p-8 text-center text-gray-500">Loading admin dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
                    <p className="text-gray-500">System management and statistics</p>
                </div>
                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'overview' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'users' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('cases')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'cases' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Case Management
                    </button>
                    <button
                        onClick={() => { setActiveTab('logs'); fetchLogs(); }}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'logs' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        System Logs
                    </button>
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Total Users</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.users}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Total Cases</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.cases}</p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                            <FileText size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">System Status</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">Healthy</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-full text-green-600">
                            <Activity size={24} />
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">System Users</h2>
                        <button
                            onClick={() => {
                                setShowUserForm(!showUserForm);
                                setFormSuccess('');
                                setFormError('');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition"
                        >
                            <Plus size={18} /> {showUserForm ? 'Cancel' : 'Create New User'}
                        </button>
                    </div>

                    {showUserForm && (
                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                            <h3 className="font-semibold text-lg mb-4 text-gray-800">Create New Internal User</h3>
                            {formSuccess && <div className="mb-4 bg-green-100 text-green-700 p-3 rounded">{formSuccess}</div>}
                            {formError && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">{formError}</div>}

                            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="STAFF">Staff</option>
                                        <option value="LAWYER">Lawyer</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>

                                {newUser.role === 'STAFF' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select
                                            value={newUser.department}
                                            onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Select Department</option>
                                            <option value="LEGAL">Legal</option>
                                            <option value="HR">HR</option>
                                            <option value="IT">IT</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                )}

                                {newUser.role === 'LAWYER' && (
                                    <>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization (Case Types)</label>
                                            <div className="flex gap-4 flex-wrap">
                                                {['CIVIL', 'CRIMINAL', 'CORPORATE', 'MATRIMONIAL'].map(type => (
                                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={newUser.case_types?.includes(type)}
                                                            onChange={e => {
                                                                const types = e.target.checked
                                                                    ? [...(newUser.case_types || []), type]
                                                                    : newUser.case_types.filter(t => t !== type);
                                                                setNewUser({ ...newUser, case_types: types });
                                                            }}
                                                            className="rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700 capitalize">{type.toLowerCase()}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={newUser.experience_years}
                                                onChange={e => setNewUser({ ...newUser, experience_years: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={newUser.rating}
                                                onChange={e => setNewUser({ ...newUser, rating: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating Count (Reviews)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={newUser.rating_count}
                                                onChange={e => setNewUser({ ...newUser, rating_count: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="e.g. 10"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={newUser.consultation_fee}
                                                onChange={e => setNewUser({ ...newUser, consultation_fee: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="md:col-span-2 pt-2">
                                    <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 transition w-full md:w-auto">
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'LAWYER' ? 'bg-indigo-100 text-indigo-800' :
                                                        user.role === 'STAFF' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                            >
                                                <Edit size={16} /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Edit Modal */}
                    {showEditModal && editingUser && (
                        <EditUserModal
                            user={editingUser}
                            onClose={() => setShowEditModal(false)}
                            onSave={async (updatedData) => {
                                try {
                                    await api.put(`/admin/users/${updatedData.id}/profile`, updatedData);
                                    setShowEditModal(false);
                                    fetchData();
                                    await api.put(`/admin/users/${updatedData.id}/profile`, updatedData);
                                    setShowEditModal(false);
                                    fetchData();
                                    toast.success('User updated successfully');
                                } catch (error) {
                                    console.error(error);
                                    toast.error('Failed to update user');
                                    throw error; // Re-throw to handle loading state in modal if needed
                                }
                            }}
                        />
                    )}
                </div>
            )}

            {/* Cases Tab */}
            {activeTab === 'cases' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800">All Cases</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cases.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">#{c.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.client?.clientProfile?.name || c.client?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.case_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                 ${c.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    c.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {cases.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">No cases found in the system.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800">System Logs</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{log.action}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{log.user_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.entity_type} #{log.entity_id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{JSON.stringify(log.details)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(log.created_at || log.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">No logs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
