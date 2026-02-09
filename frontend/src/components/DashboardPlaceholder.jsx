import React from 'react';

const Dashboard = ({ role }) => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">{role} Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <p>Welcome to the {role.toLowerCase()} portal.</p>
                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded">
                    Work in progress...
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
