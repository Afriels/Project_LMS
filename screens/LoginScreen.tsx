
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

// Mock users for demonstration
const mockUsers = [
    { id: 1, email: 'admin@school.com', password: 'password', nama: 'Admin User', role: Role.ADMIN },
    { id: 2, email: 'guru@school.com', password: 'password', nama: 'Guru Hebat', role: Role.GURU },
    { id: 3, email: 'siswa@school.com', password: 'password', nama: 'Siswa Rajin', role: Role.SISWA, kelas_id: 101 },
];


const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('siswa@school.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (user) {
            login(user);
        } else {
            setError('Invalid email or password');
        }
    };
    
    const setCredentials = (role: Role) => {
        const user = mockUsers.find(u => u.role === role);
        if (user) {
            setEmail(user.email);
            setPassword(user.password);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-indigo-600">Smart School LMS</h1>
                    <p className="mt-2 text-gray-600">Please sign in to your account</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
                 <div className="text-sm text-center text-gray-500">
                    <p>Or quick login as:</p>
                    <div className="flex justify-center space-x-4 mt-2">
                        <button onClick={() => setCredentials(Role.ADMIN)} className="font-medium text-indigo-600 hover:text-indigo-500">Admin</button>
                        <button onClick={() => setCredentials(Role.GURU)} className="font-medium text-indigo-600 hover:text-indigo-500">Teacher</button>
                        <button onClick={() => setCredentials(Role.SISWA)} className="font-medium text-indigo-600 hover:text-indigo-500">Student</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;

