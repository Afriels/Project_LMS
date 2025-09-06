import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role, Materi, Kelas } from '../types';
import { Paperclip, Video, Link as LinkIcon } from 'lucide-react';
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

            // Fetch class details
            const { data: classData } = await supabase.from('kelas').select('*').eq('id', user.kelas_id).single();
            setKelas(classData);
            
            // Fetch materials for the class
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


const ClassesScreen: React.FC = () => {
    const { user } = useAuth();

    // This screen could be expanded with views for teachers and admins
    // For now, it focuses on the student view.
    if (user?.role === Role.SISWA) {
        return <StudentClassView />;
    }
    
    // Placeholder for other roles
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Class Management</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p>Class management features for Admins and Teachers would be displayed here.</p>
            </div>
        </div>
    );
};

export default ClassesScreen;