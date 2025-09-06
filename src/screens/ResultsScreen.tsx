
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role, Attempt, AttemptStatus } from '../types';
import { supabase } from '../services/supabaseClient';

const StudentResultsView: React.FC = () => {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttempts = async () => {
            if (!user) return;
            const { data, error } = await supabase
                .from('attempt')
                .select(`
                    *,
                    ujian ( judul )
                `)
                .eq('user_id', user.id)
                .order('start_time', { ascending: false });

            if (data) {
                setAttempts(data);
            }
            setLoading(false);
        };
        fetchAttempts();
    }, [user]);

    if (loading) return <div>Loading results...</div>

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Results</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {attempts.map(attempt => {
                            return (
                                <tr key={attempt.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attempt.ujian?.judul}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(attempt.start_time).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {attempt.score ? attempt.score.toFixed(2) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            attempt.status === AttemptStatus.GRADED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {attempt.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">View Details</a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {attempts.length === 0 && <p className="p-6 text-center text-gray-500">You haven't completed any exams yet.</p>}
            </div>
        </div>
    );
};


const ResultsScreen: React.FC = () => {
    const { user } = useAuth();

    if (user?.role === Role.SISWA) {
        return <StudentResultsView />;
    }

    // Placeholder for Teacher/Admin view
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Exam Results</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p>Detailed reports and analytics for Teachers and Admins would be displayed here. This could include class averages, question difficulty analysis, and export-to-CSV functionality.</p>
            </div>
        </div>
    );
};

export default ResultsScreen;
