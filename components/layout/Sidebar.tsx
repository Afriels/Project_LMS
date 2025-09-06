import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Role, AppView } from '../../types';
import { LayoutDashboard, Book, Banknote, FileText, BarChart2 } from 'lucide-react'; // Using lucide-react for icons

interface SidebarProps {
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
}

// Fix: Define a type for navigation items to ensure `item.view` has the correct `AppView` type.
interface NavItem {
    view: AppView;
    label: string;
    icon: React.ElementType;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
    const { user } = useAuth();

    // Fix: Explicitly type `navItems` using the `NavItem` interface.
    // This prevents TypeScript from widening the `type` property of `view` to a generic `string`,
    // which caused the type error when calling `setCurrentView`.
    const navItems: Record<Role, NavItem[]> = {
        [Role.ADMIN]: [
            { view: { type: 'dashboard' }, label: 'Dashboard', icon: LayoutDashboard },
            { view: { type: 'classes' }, label: 'Manage Classes', icon: Book },
            { view: { type: 'results' }, label: 'All Results', icon: BarChart2 },
        ],
        [Role.GURU]: [
            { view: { type: 'dashboard' }, label: 'Dashboard', icon: LayoutDashboard },
            { view: { type: 'classes' }, label: 'My Classes', icon: Book },
            { view: { type: 'questionBank' }, label: 'Question Bank', icon: Banknote },
            { view: { type: 'exams' }, label: 'Exams', icon: FileText },
            { view: { type: 'results' }, label: 'Results', icon: BarChart2 },
        ],
        [Role.SISWA]: [
            { view: { type: 'dashboard' }, label: 'Dashboard', icon: LayoutDashboard },
            { view: { type: 'classes' }, label: 'My Class', icon: Book },
            { view: { type: 'exams' }, label: 'Exams', icon: FileText },
            { view: { type: 'results' }, label: 'My Results', icon: BarChart2 },
        ],
    };

    const userNavItems = user ? navItems[user.role] : [];

    return (
        <aside className="flex flex-col w-64 h-screen px-4 py-8 bg-white border-r-2 border-gray-200">
             <h2 className="text-3xl font-bold text-center text-indigo-600">SmartLMS</h2>

            <div className="flex flex-col justify-between flex-1 mt-6">
                <nav>
                    {userNavItems.map((item, index) => (
                        <a
                            key={index}
                            className={`flex items-center px-4 py-3 mt-4 text-gray-700 rounded-lg transition-colors duration-300 transform ${
                                currentView.type === item.view.type
                                    ? 'bg-indigo-500 text-white'
                                    : 'hover:bg-gray-200 hover:text-gray-700'
                            }`}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentView(item.view);
                            }}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="mx-4 font-medium">{item.label}</span>
                        </a>
                    ))}
                </nav>
            </div>
        </aside>
    );
};


export default Sidebar;