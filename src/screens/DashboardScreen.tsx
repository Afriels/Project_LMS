
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { Users, BookOpen, FileText } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

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

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, exams: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const { count: students } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'siswa');
            const { count: teachers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'guru');
            const { count: classes } = await supabase.from('kelas').select('*', { count: 'exact', head: true });
            const { count: exams } = await supabase.from('ujian').select('*', { count: 'exact', head: true });
            setStats({ students: students || 0, teachers: teachers || 0, classes: classes || 0, exams: exams || 0 });
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Students" value={stats.students.toString()} icon={Users} />
                <StatCard title="Total Teachers" value={stats.teachers.toString()} icon={Users} />
                <StatCard title="Total Classes" value={stats.classes.toString()} icon={BookOpen} />
                <StatCard title="Active Exams" value={stats.exams.toString()} icon={FileText} />
            </div>
        </div>
    );
};

const TeacherDashboard: React.FC = () => {
     // In a real app, these would be fetched from Supabase
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="My Classes" value="5" icon={BookOpen} />
                <StatCard title="Upcoming Exams" value="3" icon={FileText} />
                <StatCard title="Grading Needed" value="8 essays" icon={Users} />
            </div>
        </div>
    );
};

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<{ className: string; examCount: number; recentScore: string }>({ className: '...', examCount: 0, recentScore: 'N/A' });

    useEffect(() => {
        if (!user || !user.kelas_id) return;

        const fetchStats = async () => {
            const { data: kelas } = await supabase.from('kelas').select('nama').eq('id', user.kelas_id).single();
            const { count: exams } = await supabase.from('ujian').select('*', { count: 'exact', head: true }).eq('kelas_id', user.kelas_id);
            const { data: latestAttempt } = await supabase.from('attempt').select('score').eq('user_id', user.id).not('score', 'is', null).order('end_time', { ascending: false }).limit(1).single();
            
            setStats({
                className: kelas?.nama || 'Unknown',
                examCount: exams || 0,
                recentScore: latestAttempt?.score?.toFixed(2) || 'N/A'
            });
        };

        fetchStats();
    }, [user]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Enrolled Class" value={stats.className} icon={BookOpen} />
                <StatCard title="Pending Exams" value={stats.examCount.toString()} icon={FileText} />
                <StatCard title="Recent Grade" value={stats.recentScore} icon={Users} />
            </div>
        </div>
    );
};


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
