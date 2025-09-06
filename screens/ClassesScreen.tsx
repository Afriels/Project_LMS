import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role, Materi, Kelas, User } from '../types';
import { Paperclip, Video, Link as LinkIcon, Edit } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const MaterialItem: React.FC<{ material: Materi }> = ({ material }) => {
    const getIcon = () => {
        if (material.judul.toLowerCase().includes('video')) return <Video className="w-5 h-5 text-red-500" />;
        if (material.judul.toLowerCase().includes('link')) return <LinkIcon className="w-5 h-5 text-blue-500" />;
        return <Paperclip className="w-5 h-5 text-green-500" />;
    };

    return (
        <a href={material.file_url || '#'} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
                <div className="mr-4">{getIcon()}</div>
                <div>
                    <h3 className="font-semibold text-gray-800">{material.judul}</h3>
                    <p className="text-sm text-gray-600">{material.konten_html}</p>
                    <p className="text-xs text-gray-400 mt-1">Published on: {new Date(material.publish_date).toLocaleDateString()}</p>
                </div>
            </div>
        </a>
    );
};

const StudentClassView: React.FC = () => {
    const { user } = useAuth();
    const [kelas, setKelas] = useState<Kelas | null>(null);
    const [materials, setMaterials] = useState<Materi[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassData = async () => {
            if (!user?.kelas_id) {
                setLoading(false);
                return;
            };

            const { data: classData } = await supabase.from('kelas').select('*').eq('id', user.kelas_id).single();
            setKelas(classData);
            
            const { data: materialData } = await supabase.from('materi').select('*').eq('kelas_id', user.kelas_id).order('publish_date', { ascending: false });
            setMaterials(materialData || []);
            
            setLoading(false);
        };

        fetchClassData();
    }, [user]);

    if (loading) {
        return <div>Loading class data...</div>
    }

    if (!kelas) {
        return <div>You are not enrolled in any class.</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Class: {kelas.nama}</h1>
            <p className="text-gray-600 mb-6">Here are the materials for your class.</p>
            <div className="space-y-4">
                {materials.length > 0 ? (
                    materials.map(material => <MaterialItem key={material.id} material={material} />)
                ) : (
                    <p>No materials have been uploaded for this class yet.</p>
                )}
            </div>
        </div>
    );
};

const AdminUserManagementView: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from('users').select('*').order('nama', { ascending: true });
            if (error) {
                console.error('Error fetching users:', error);
                setError('Failed to load user data.');
            } else {
                setUsers(data || []);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: number, newRole: Role) => {
        // Optimistically update UI
        setUsers(currentUsers =>
            currentUsers.map(u => (u.id === userId ? { ...u, role: newRole } : u))
        );

        const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);

        if (error) {
            console.error('Error updating role:', error);
            alert(`Failed to update role for user ID ${userId}. Please check permissions and refresh.`);
            // Revert UI on error (optional, could also refetch)
             const { data: freshUsers } = await supabase.from('users').select('*').order('nama', { ascending: true });
             if (freshUsers) setUsers(freshUsers);
        }
    };
    
    if (loading) return <div>Loading users...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {Object.values(Role).map(roleValue => (
                                            <option key={roleValue} value={roleValue} className="capitalize">{roleValue}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const ClassesScreen: React.FC = () => {
    const { user } = useAuth();

    if (user?.role === Role.ADMIN) {
        return <AdminUserManagementView />;
    }
    if (user?.role === Role.SISWA) {
        return <StudentClassView />;
    }
    
    // Placeholder for GURU role
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Classes</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p>Class management features for Teachers would be displayed here.</p>
            </div>
        </div>
    );
};

export default ClassesScreen;
