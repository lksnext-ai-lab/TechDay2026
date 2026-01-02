import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};

export const ConfigProvider = ({ children }) => {
    // API Config (sourced from env, read-only/system level usually, but we keep option to extend)
    const [apiConfig] = useState({
        apiKey: import.meta.env.VITE_API_KEY || '',
        baseUrl: import.meta.env.VITE_API_BASE_URL || ''
    });

    // Chat Config (sourced from localStorage -> env -> empty)
    const [chatConfig, setChatConfig] = useState(() => {
        const saved = localStorage.getItem('lks_techday_chat_config');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            appId: import.meta.env.VITE_APP_ID || '',
            agentId: import.meta.env.VITE_AGENT_ID || '',
            title: import.meta.env.VITE_CHAT_TITLE || 'Asistente IA'
        };
    });

    // Save to localStorage whenever config changes
    useEffect(() => {
        localStorage.setItem('lks_techday_chat_config', JSON.stringify(chatConfig));
    }, [chatConfig]);

    const updateChatConfig = (newConfig) => {
        setChatConfig(prev => ({ ...prev, ...newConfig }));
    };

    const value = {
        apiConfig,
        chatConfig,
        updateChatConfig
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
