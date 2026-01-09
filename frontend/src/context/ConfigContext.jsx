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
        baseUrl: import.meta.env.VITE_API_BASE_URL || ''
    });

    // Global App ID (shared between modules)
    const [globalAppId, setGlobalAppId] = useState(() => {
        return localStorage.getItem('lks_techday_app_id') || import.meta.env.VITE_APP_ID || '';
    });

    // Chat Config
    const [chatConfig, setChatConfig] = useState(() => {
        const saved = localStorage.getItem('lks_techday_chat_config');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            agentId: import.meta.env.VITE_AGENT_ID || '',
            title: import.meta.env.VITE_CHAT_TITLE || 'Asistente IA'
        };
    });

    // Swarm Config
    const [swarmConfig, setSwarmConfig] = useState(() => {
        const saved = localStorage.getItem('lks_techday_swarm_config');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            title: 'Sala de Brainstorming',
            moderatorAgentId: '',
            agents: [
                { id: 'strategist', name: 'Estratega', description: 'Visión de negocio, ROI y estrategia.', agentId: '', isActive: true, color: '#1a4b8c' },
                { id: 'tech', name: 'Tech Lead', description: 'Arquitectura, factibilidad y tecnología.', agentId: '', isActive: true, color: '#2c7a7b' },
                { id: 'cx', name: 'CX Designer', description: 'Experiencia de usuario, diseño y empatía.', agentId: '', isActive: true, color: '#702459' },
                { id: 'risk', name: 'Risk Analyst', description: 'Seguridad, cumplimiento y ética.', agentId: '', isActive: true, color: '#9c4221' }
            ]
        };
    });

    // SAT Config
    const [satConfig, setSatConfig] = useState(() => {
        const saved = localStorage.getItem('lks_techday_sat_config');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            siloId: '',
            docsSiloId: ''
        };
    });

    // Save to localStorage whenever config changes
    useEffect(() => {
        localStorage.setItem('lks_techday_app_id', globalAppId);
    }, [globalAppId]);

    useEffect(() => {
        localStorage.setItem('lks_techday_chat_config', JSON.stringify(chatConfig));
    }, [chatConfig]);

    useEffect(() => {
        localStorage.setItem('lks_techday_swarm_config', JSON.stringify(swarmConfig));
    }, [swarmConfig]);

    useEffect(() => {
        localStorage.setItem('lks_techday_sat_config', JSON.stringify(satConfig));
    }, [satConfig]);

    const updateChatConfig = (newConfig) => {
        setChatConfig(prev => ({ ...prev, ...newConfig }));
    };

    const updateSwarmConfig = (newConfig) => {
        setSwarmConfig(prev => ({ ...prev, ...newConfig }));
    };

    const updateSatConfig = (newConfig) => {
        setSatConfig(prev => ({ ...prev, ...newConfig }));
    };

    const value = {
        apiConfig,
        globalAppId,
        setGlobalAppId,
        chatConfig,
        updateChatConfig,
        swarmConfig,
        updateSwarmConfig,
        satConfig,
        updateSatConfig
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
