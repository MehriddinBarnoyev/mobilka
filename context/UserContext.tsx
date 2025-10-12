// UserContext.tsx
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import api from '../core/api/apiService';

export type Authority =
    | 'VIEW_VIDEOS'
    | 'UPLOAD_VIDEO'
    | 'DELETE_GROUP'
    | 'CREATE_USER'
    | 'DELETE_USER'
    | 'UPDATE_USER'
    | 'READ_USER'
    | 'DELETE_VIDEO'
    | 'CREATE_GROUP'
    | 'VIEW_GROUP';

export type User = {
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    id: number;
    login: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string;
    designedName: string;
    imageUrl: string | null;
    activated: boolean;
    langKey: string;
    pinCode: string | null;
    agreedToTerms: boolean;
    authorities: Authority[];
};

type UserContextValue = {
    user: User | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    has: (a: Authority) => boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

type Props = { children: React.ReactNode };

export const UserProvider: React.FC<Props> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<User>('/services/userms/api/account');
            setUser(res.data);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const value = useMemo<UserContextValue>(
        () => ({
            user,
            loading,
            error,
            refresh: fetchUser,
            has: (a: Authority) => Boolean(user?.authorities?.includes(a)),
            setUser,
        }),
        [user, loading, error],
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within a UserProvider');
    return ctx;
};
