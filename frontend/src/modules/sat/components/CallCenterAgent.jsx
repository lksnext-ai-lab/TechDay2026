import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Bot, User, Phone } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';

const CallCenterAgent = ({ onBack }) => {
    const { globalAppId, satConfig, apiConfig } = useConfig();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: '¡Hola! Soy tu asistente de Soporte Técnico. ¿En qué puedo ayudarte hoy? Puedo crear incidencias y consultar modelos de electrodomésticos.'
            }
        ]);

        const resetConversation = async () => {
            if (!globalAppId || !satConfig.agentId) return;
            try {
                await fetch(`${apiConfig.baseUrl}/api/chat/${globalAppId}/${satConfig.agentId}/reset`, {
                    method: 'POST'
                });
                setConversationId(null);
            } catch (error) {
                console.error("Failed to reset sat conversation:", error);
            }
        };
        resetConversation();
    }, [globalAppId, satConfig.agentId, apiConfig.baseUrl]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        if (!satConfig.agentId) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Error: No se ha configurado el Agent ID para el Call Center. Por favor ve a Configuración > SAT."
            }]);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${apiConfig.baseUrl}/api/chat/${globalAppId}/${satConfig.agentId}/call`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    stream: false,
                    ...(conversationId !== null && { conversation_id: conversationId })
                })
            });

            if (!response.ok) {
                throw new Error('Error connecting to agent');
            }

            const data = await response.json();

            if (data.conversation_id) {
                setConversationId(data.conversation_id);
            }

            // Assuming the standard Mattin response structure
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || "Lo siento, no he podido procesar tu respuesta."
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Lo siento, ha ocurrido un error de conexión. Por favor inténtalo de nuevo."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onBack}
                    className="btn"
                    style={{ background: 'var(--accent)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={20} color="var(--text-main)" />
                </button>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={24} />
                        Call Center Agent
                    </h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Asistente virtual conectado al sistema de incidencias.</p>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{
                flex: 1,
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--accent)'
            }}>
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%'
                            }}
                        >
                            {msg.role === 'assistant' && (
                                <div style={{
                                    minWidth: '40px',
                                    height: '40px',
                                    background: 'var(--primary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Bot size={24} color="white" />
                                </div>
                            )}

                            <div style={{
                                padding: '1.25rem',
                                background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-offset)',
                                color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                borderRadius: '1rem',
                                borderTopLeftRadius: msg.role === 'assistant' ? 0 : '1rem',
                                borderTopRightRadius: msg.role === 'user' ? 0 : '1rem',
                                boxShadow: 'var(--shadow-sm)',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {msg.content}
                            </div>

                            {msg.role === 'user' && (
                                <div style={{
                                    minWidth: '40px',
                                    height: '40px',
                                    background: '#ddd',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <User size={24} color="#666" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{
                                minWidth: '40px',
                                height: '40px',
                                background: 'var(--primary)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Bot size={24} color="white" />
                            </div>
                            <div style={{
                                padding: '1rem',
                                background: 'var(--bg-offset)',
                                borderRadius: '1rem',
                                borderTopLeftRadius: 0
                            }}>
                                <span className="loading-dots">Escribiendo</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{
                    padding: '1.5rem',
                    background: 'var(--bg-offset)',
                    borderTop: '1px solid var(--accent)',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <form onSubmit={handleSend} style={{ display: 'flex', width: '100%', gap: '1rem' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe la incidencia..."
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid #ccc',
                                fontSize: '1rem'
                            }}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !input.trim()}
                            style={{
                                padding: '0 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: (isLoading || !input.trim()) ? 0.7 : 1
                            }}
                        >
                            <Send size={20} />
                            Enviar
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                .loading-dots::after {
                    content: ' .';
                    animation: dots 1s steps(5, end) infinite;
                }
                @keyframes dots {
                    0%, 20% { content: ' .'; }
                    40% { content: ' ..'; }
                    60% { content: ' ...'; }
                    80%, 100% { content: ''; }
                }
            `}</style>
        </div>
    );
};

export default CallCenterAgent;
