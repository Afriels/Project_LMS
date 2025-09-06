
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

// IMPORTANT: These credentials must match users you've created in your Supabase project.
const mockUsers = [
    { email: 'admin@school.com', password: 'password', role: Role.ADMIN },
    { email: 'guru@school.com', password: 'password', role: Role.GURU },
    { email: 'siswa@school.com', password: 'password', role: Role.SISWA },
];

const LoginScreen: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('siswa@school.com');
    const [password, setPassword] = useState('password');
    const [nama, setNama] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signUp } = useAuth();

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (isSignUp) {
            const { error } = await signUp({
                email,
                password,
                options: {
                    data: {
                        nama: nama,
                        role: Role.SISWA, // Default role for new signups
                    },
                },
            });
            if (error) {
                setError(error.message);
            } else {
                setMessage('Registration successful! Please check your email to confirm your account.');
                setIsSignUp(false); // Switch back to login view
            }
        } else {
            const { error } = await login(email, password);
            if (error) {
                setError(error.message);
            }
        }
        setLoading(false);
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
                    <p className="mt-2 text-gray-600">
                        {isSignUp ? 'Create a new account' : 'Please sign in to your account'}
                    </p>
                </div>

                {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md text-center">{message}</p>}
                
                <form className="mt-8 space-y-6" onSubmit={handleAuthAction}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        {isSignUp && (
                             <div>
                                <input
                                    id="full-name"
                                    name="nama"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Full Name"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 ${isSignUp ? '' : 'rounded-t-md'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
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
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {loading ? 'Processing...' : (isSignUp ? 'Sign up' : 'Sign in')}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center">
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-indigo-600 hover:text-indigo-500">
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                </div>
                
                {!isSignUp && (
                    <div className="text-sm text-center text-gray-500">
                        <p>Or quick login as:</p>
                        <div className="flex justify-center space-x-4 mt-2">
                            <button onClick={() => setCredentials(Role.ADMIN)} className="font-medium text-indigo-600 hover:text-indigo-500">Admin</button>
                            <button onClick={() => setCredentials(Role.GURU)} className="font-medium text-indigo-600 hover:text-indigo-500">Teacher</button>
                            <button onClick={() => setCredentials(Role.SISWA)} className="font-medium text-indigo-600 hover:text-indigo-500">Student</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginScreen;
