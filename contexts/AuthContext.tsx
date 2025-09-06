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
                        .eq('email', session.user.email)
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
                        .eq('email', session.user.email)
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

    // FIX: `signUp` implementation corrected for supabase-js v2.
    // The original had an incorrect type and was not robust (it would crash if options were missing).
    const signUp = async (credentials: SignUpWithPasswordCredentials) => {
        const { email, password, options } = credentials;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options,
        });

        // Supabase sends a confirmation email. The user will be logged in after clicking the link.
        // The trigger will handle creating the public user profile.
        
        return { error };
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

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
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
