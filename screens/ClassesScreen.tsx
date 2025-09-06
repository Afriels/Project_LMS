import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role, Materi } from '../types';
import { Paperclip, Video, Link as LinkIcon } from 'lucide-react';

const mockMaterials: Materi[] = [
    { id: 1, kelas_id: 101, author_id: 2, judul: 'Bab 1: Pengenalan Sejarah Indonesia', konten_html: 'Ini adalah ringkasan bab 1.', publish_date: '2023-10-01', file_url: '#' },
    { id: 2, kelas_id: 101, author_id: 2, judul: 'Video: Perang Diponegoro', konten_html: 'Tonton video penjelasan.', publish_date: '2023-10-03', file_url: '#' },
    { id: 3, kelas_id: 101, author_id: 2, judul: 'Link Eksternal: Museum Nasional', konten_html: 'Kunjungi website museum.', publish_date: '2023-10-05', file_url: '#' },
];

const MaterialItem: React.FC<{ material: Materi }> = ({ material }) => {
    const getIcon = () => {
        if (material.judul.toLowerCase().includes('video')) return <Video className="w-5 h-5 text-red-500" />;
        if (material.judul.toLowerCase().includes('link')) return <LinkIcon className="w-5 h-5 text-blue-500" />;
        return <Paperclip className="w-5 h-5 text-green-500" />;
    };

    return (
        <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
                <div className="mr-4">{getIcon()}</div>
                <div>
                    <h3 className="font-semibold text-gray-800">{material.judul}</h3>
                    <p className="text-sm text-gray-600">{material.konten_html}</p>
                    <p className="text-xs text-gray-400 mt-1">Published on: {material.publish_date}</p>
                </div>
            </div>
        </a>
    );
};

const StudentClassView: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Class: X IPA 1</h1>
            <p className="text-gray-600 mb-6">Here are the materials for your class.</p>
            <div className="space-y-4">
                {mockMaterials.map(material => <MaterialItem key={material.id} material={material} />)}
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