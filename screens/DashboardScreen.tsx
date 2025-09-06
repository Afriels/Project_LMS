import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { Users, BookOpen, FileText } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-indigo-500 text-white rounded-full p-3 mr-4">
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Students" value="1,250" icon={Users} />
            <StatCard title="Total Teachers" value="75" icon={Users} />
            <StatCard title="Total Classes" value="45" icon={BookOpen} />
            <StatCard title="Active Exams" value="12" icon={FileText} />
        </div>
    </div>
);

const TeacherDashboard: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="My Classes" value="5" icon={BookOpen} />
            <StatCard title="Upcoming Exams" value="3" icon={FileText} />
            <StatCard title="Grading Needed" value="8 essays" icon={Users} />
        </div>
    </div>
);

const StudentDashboard: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Enrolled Class" value="X IPA 1" icon={BookOpen} />
            <StatCard title="Pending Exams" value="2" icon={FileText} />
            <StatCard title="Recent Grade" value="85.5" icon={Users} />
        </div>
    </div>
);


const DashboardScreen: React.FC = () => {
    const { user } = useAuth();

    switch (user?.role) {
        case Role.ADMIN:
            return <AdminDashboard />;
        case Role.GURU:
            return <TeacherDashboard />;
        case Role.SISWA:
            return <StudentDashboard />;
        default:
            return <div>Loading...</div>;
    }
};

export default DashboardScreen;