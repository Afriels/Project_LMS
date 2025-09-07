import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Role } from '../types';
// FIX: The user reported errors that types are not exported from '@supabase/supabase-js'.
// This is typical of a version mismatch (e.g. using a v1 library with v2 code).
// The code below is corrected for supabase-js v2, where these types are correctly exported.
// Using `import type` is a good practice for type-only imports.
import type { AuthError, Session, SignUpWithPasswordCredentials } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    // FIX: The `signUp` function should expect `SignUpWithPasswordCredentials` as defined by supabase-js v2.
    // The previous type was incorrect and inconsistent with its usage in LoginScreen.tsx.
    signUp: (credentials: SignUpWithPasswordCredentials) => Promise<{ error: AuthError | null }>;
    logout: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            // FIX: `getSession` is the correct async method in supabase-js v2. The error reported suggests an environment issue.
            // The original implementation didn't handle errors from this call.
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Error fetching session:', error.message);
            } else {
                setSession(session);
                if (session?.user) {
                    const { data: userProfile } = await supabase
                        .from('users')
                        .select('*')
                        .eq('auth_id', session.user.id)
                        .single();
                    setUser(userProfile);
                }
            }
            setLoading(false);
        };
        
        getSession();

        // FIX: `onAuthStateChange` is the correct method in supabase-js v2.
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                if (session?.user) {
                     const { data: userProfile } = await supabase
                        .from('users')
                        .select('*')
                        .eq('auth_id', session.user.id)
                        .single();
                    setUser(userProfile as User | null);
                } else {
                    setUser(null);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // FIX: `signInWithPassword` is the correct method in supabase-js v2.
    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (credentials: SignUpWithPasswordCredentials) => {
        // FIX: The `SignUpWithPasswordCredentials` is a union type. A type guard is needed to safely
        // access the `email` property, as the app only supports email-based sign-up.
        if (!('email' in credentials)) {
            return { 
                error: { name: "AuthError", message: "Only email sign-up is supported." } as AuthError 
            };
        }

        // Step 1: Sign up the user with Supabase Auth
        // FIX: Pass `credentials` directly. Reconstructing the object caused a type error.
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp(credentials);

        if (signUpError) {
            return { error: signUpError };
        }

        // Step 2: If auth sign-up is successful, create a profile in the public 'users' table.
        // This makes the app resilient, as it doesn't rely on a database trigger which might be missing.
        if (signUpData.user) {
            // FIX: The `options.data` is a generic `object`. Cast it to access custom properties like `nama` and `role`.
            const userData = credentials.options?.data as { nama?: string; role?: Role };
            const { error: insertError } = await supabase.from('users').insert({
                auth_id: signUpData.user.id,
                email: credentials.email, // Safe to access now.
                nama: userData?.nama || 'New User',
                role: userData?.role || Role.SISWA,
            });

            if (insertError) {
                console.error("Critical: User created in auth, but profile creation failed:", insertError);
                // This is a problematic state. For now, return a user-friendly error.
                // In a real production app, you might want to add logic to delete the auth user or alert an admin.
                return {
                    error: {
                        name: "ProfileCreationError",
                        message: "Account created, but profile could not be saved. Please contact support.",
                    } as AuthError,
                };
            }
        }
        
        return { error: null };
    };


    // FIX: `signOut` is the correct method in supabase-js v2.
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };
    
    const value = {
        user,
        session,
        loading,
        login,
        signUp,
        logout,
    };

    // Show a loading indicator while the initial session is being fetched.
    // This prevents a blank white screen on initial load.
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                     <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading Smart School LMS...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
