'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: { email: string; fullName?: string } | null;
    token: string | null;
    login: (token: string, email: string, fullName: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ email: string; fullName?: string } | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const getFallbackName = (email: string) => {
        return email.split('@')[0].split(/[._-]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    };

    useEffect(() => {
        const savedToken = localStorage.getItem('permitops_token');
        const savedUser = localStorage.getItem('permitops_user');
        const savedName = localStorage.getItem('permitops_name');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser({ email: savedUser, fullName: savedName || getFallbackName(savedUser) });
        }
    }, []);

    const login = (token: string, email: string, fullName?: string) => {
        const name = fullName || getFallbackName(email);
        setToken(token);
        setUser({ email, fullName: name });
        localStorage.setItem('permitops_token', token);
        localStorage.setItem('permitops_user', email);
        localStorage.setItem('permitops_name', name);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('permitops_token');
        localStorage.removeItem('permitops_user');
        localStorage.removeItem('permitops_name');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
