'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: any;
    token: string | null;
    login: (token: string, email: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('permitops_token');
        const savedUser = localStorage.getItem('permitops_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser({ email: savedUser });
        }
    }, []);

    const login = (token: string, email: string) => {
        setToken(token);
        setUser({ email });
        localStorage.setItem('permitops_token', token);
        localStorage.setItem('permitops_user', email);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('permitops_token');
        localStorage.removeItem('permitops_user');
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
