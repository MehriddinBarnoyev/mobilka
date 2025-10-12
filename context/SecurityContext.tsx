import React, {createContext, useState, useEffect, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SecurityContext = createContext<{
    isSecured: boolean;
    setIsSecured: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const SecurityContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSecured, setIsSecured] = useState(false);

    // Load isSecured from AsyncStorage on mount
    useEffect(() => {
        const loadSecurityState = async () => {
            try {
                const stored = await AsyncStorage.getItem('isSecured');
                if (stored !== null) {
                    setIsSecured(JSON.parse(stored));
                }
            } catch (error) {
                console.error('Failed to load security state:', error);
            }
        };
        loadSecurityState();
    }, []);

    // Save isSecured to AsyncStorage when it changes
    useEffect(() => {
        const saveSecurityState = async () => {
            try {
                await AsyncStorage.setItem('isSecured', JSON.stringify(isSecured));
            } catch (error) {
                console.error('Failed to save security state:', error);
            }
        };
        saveSecurityState();
    }, [isSecured]);

    return (
        <SecurityContext.Provider value={{ isSecured, setIsSecured }}>
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (!context) {
        throw new Error('useSecurity must be used within a SecurityContextProvider');
    }
    return context;
};