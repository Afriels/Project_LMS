import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react'; // Using lucide-react for icons

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b-2 border-gray-200">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">Welcome to Smart School LMS</h2>
            </div>
            <div className="flex items-center">
                <div className="mr-6 text-right">
                    <div className="font-semibold text-gray-700">{user?.nama}</div>
                    <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;