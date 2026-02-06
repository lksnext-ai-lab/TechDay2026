import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { ArrowLeft, Play, Send, Bot, User, Brain, Info, CheckCircle, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SchemaInfoButton from '../../components/SchemaInfoButton';

const SwarmModule = () => {
    const { globalAppId, swarmConfig, apiConfig } = useConfig();
    const [phase, setPhase] = useState('input'); // input, debating, user_turn, finished
    const [topic, setTopic] = useState('');
    const [messages, setMessages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeAgentIndex, setActiveAgentIndex] = useState(-1);
    const [userInput, setUserInput] = useState('');
    const messagesEndRef = useRef(null);

    const activeAgents = swarmConfig.agents.filter(a => a.isActive);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeAgentIndex, phase]);

    // ... (rest of the state and scroll logic)

    const resetAgents = async () => {
        try {
            const allToReset = [...activeAgents];
            if (swarmConfig.moderatorAgentId) {
                allToReset.push({ id: 'moderator', agentId: swarmConfig.moderatorAgentId });
            }
            await fetch(`${apiConfig.baseUrl}/api/swarm/reset_session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId: globalAppId, agents: allToReset })
            });
        } catch (error) {
            console.error("Error resetting session:", error);
        }
    };

    // Reset on mount
    useEffect(() => {
        resetAgents();
    }, []);

    const startDebate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setPhase('debating');
        const initialMessage = { sender: 'Usuario', text: topic, type: 'user' };
        setMessages([initialMessage]);
        setIsProcessing(true);

        // Initiate the turn loop
        runSwarmLoop(initialMessage, [initialMessage], 0);
    };

    const runSwarmLoop = async (lastMsg, currentHistory, turnCount) => {
        // Stop if we exceed a maximum number of turns to prevent infinite loops/cost
        if (turnCount >= 10 || phase === 'finished') {
            finishDebate();
            return;
        }

        setActiveAgentIndex(-1);

        try {
            // 1. Ask Moderator who's next
            if (!swarmConfig.moderatorAgentId) {
                // Support legacy linear mode if no moderator is configured
                const nextIdx = turnCount % activeAgents.length;
                processAgentTurn(activeAgents[nextIdx], currentHistory, turnCount);
                return;
            }

            const modResponse = await fetch(`${apiConfig.baseUrl}/api/swarm/decide_next`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appId: globalAppId,
                    moderatorAgentId: swarmConfig.moderatorAgentId,
                    history: currentHistory.map(m => ({ sender: m.sender, text: m.text })),
                    availableAgents: activeAgents.map(a => ({ id: a.id, name: a.name, description: a.description }))
                })
            });

            if (!modResponse.ok) throw new Error("Error en el moderador");
            const decision = await modResponse.json();

            if (decision.next === 'fin') {
                finishDebate();
                return;
            }

            if (decision.next === 'you') {
                setPhase('user_turn');
                setIsProcessing(false);
                return;
            }

            const nextAgent = activeAgents.find(a => a.id === decision.next);
            if (!nextAgent) {
                // Fallback if moderator hallucinates an ID
                const fallback = activeAgents[turnCount % activeAgents.length];
                processAgentTurn(fallback, currentHistory, turnCount);
            } else {
                processAgentTurn(nextAgent, currentHistory, turnCount);
            }

        } catch (error) {
            console.error("Moderator flow error:", error);
            finishDebate();
        }
    };

    const processAgentTurn = async (agent, currentHistory, turnCount) => {
        const agentIndex = activeAgents.findIndex(a => a.id === agent.id);
        setActiveAgentIndex(agentIndex);

        try {
            const response = await fetch(`${apiConfig.baseUrl}/api/swarm/process_turn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appId: globalAppId,
                    agent: agent,
                    history: currentHistory,
                    userPrompt: turnCount === 0 ? topic : ""
                })
            });

            if (!response.ok) throw new Error("Error en el turno del agente");

            const data = await response.json();
            const newMessage = {
                sender: agent.name,
                text: data.response,
                agentId: agent.agentId,
                color: agent.color,
                type: 'agent'
            };

            const nextHistory = [...currentHistory, newMessage];
            setMessages(nextHistory);

            // After one agent responds, it's always the user's turn
            setTimeout(() => {
                setActiveAgentIndex(-1);
                setPhase('user_turn');
                setIsProcessing(false);
            }, 1000);

        } catch (error) {
            console.error("Turn error:", error);
            finishDebate();
        }
    };

    const handleUserSubmit = (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const newMessage = { sender: 'Usuario', text: userInput, type: 'user' };
        const nextHistory = [...messages, newMessage];
        setMessages(nextHistory);
        setUserInput('');
        setPhase('debating');
        setIsProcessing(true);

        // Continue the loop
        runSwarmLoop(newMessage, nextHistory, 0);
    };

    const finishDebate = () => {
        setIsProcessing(false);
        setActiveAgentIndex(-1);
        setPhase('finished');
    };

    const reset = () => {
        setPhase('input');
        setTopic('');
        setMessages([]);
        setActiveAgentIndex(-1);
        setIsProcessing(false);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/" className="btn" style={{ background: 'var(--accent)', padding: '0.5rem' }}>
                        <ArrowLeft size={20} color="var(--text-main)" />
                    </Link>
                    <div>
                        <h2 style={{ margin: 0, color: 'var(--primary)', lineHeight: 1 }}>{swarmConfig.title}</h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Multi-Agent Collaboration</span>
                    </div>
                    <SchemaInfoButton moduleId="swarm" />
                </div>
                {phase !== 'input' && (
                    <button onClick={reset} className="btn" style={{ background: 'var(--accent)', fontSize: '0.9rem' }}>
                        <RefreshCcw size={16} /> Reiniciar
                    </button>
                )}
            </div>

            {phase === 'input' && (
                <div style={{
                    background: 'white',
                    padding: '3rem',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    textAlign: 'center',
                    marginTop: '2rem'
                }}>
                    <div style={{
                        background: 'var(--primary)15',
                        width: '80px', height: '80px',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem',
                        color: 'var(--primary)'
                    }}>
                        <Brain size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Plantea un Reto al Equipo</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                        Ingresa un problema de negocio, técnico o social. Nuestro equipo de IAs especializadas debatirá para darte una perspectiva 360º.
                    </p>

                    <form onSubmit={startDebate} style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ej: ¿Cómo optimizar la logística urbana en San Sebastián usando IA?"
                            style={{
                                flex: 1,
                                padding: '1rem 1.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '2px solid var(--accent)',
                                fontSize: '1.1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--accent)'}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }} disabled={!topic.trim()}>
                            <Play size={20} /> Iniciar Debate
                        </button>
                    </form>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3rem' }}>
                        {activeAgents.map(agent => (
                            <div key={agent.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '50%',
                                    background: agent.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}>
                                    <Bot size={20} />
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{agent.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {phase !== 'input' && (
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', height: 'calc(100vh - 200px)' }}>
                    {/* Agents Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeAgents.map((agent, idx) => (
                            <div key={agent.id} style={{
                                padding: '1.25rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'white',
                                borderLeft: `6px solid ${idx === activeAgentIndex ? agent.color : '#eee'}`,
                                boxShadow: idx === activeAgentIndex ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                                transform: idx === activeAgentIndex ? 'translateX(10px)' : 'none',
                                transition: 'all 0.3s ease',
                                opacity: idx > activeAgentIndex && activeAgentIndex !== -1 ? 0.6 : 1
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px',
                                        borderRadius: '50%',
                                        background: agent.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <Bot size={18} />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{agent.name}</span>
                                </div>
                                {idx === activeAgentIndex && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: agent.color }}>
                                        <div className="typing-dot" style={{ width: '4px', height: '4px', background: agent.color, borderRadius: '50%', animation: 'typing 1s infinite' }}></div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Pensando...</span>
                                    </div>
                                )}
                                {idx < activeAgentIndex || phase === 'finished' ? (
                                    <div style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                                        <CheckCircle size={14} /> Tarea completada
                                    </div>
                                ) : null}
                            </div>
                        ))}

                        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <Info size={20} />
                                <span style={{ fontWeight: 600 }}>Sobre el proceso</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.4 }}>
                                Cada agente recibe el contexto de lo que sus colegas han aportado antes, permitiendo un hilo de pensamiento coherente.
                            </p>
                        </div>
                    </div>

                    {/* Chat Log */}
                    <div style={{
                        background: 'white',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            flex: 1,
                            padding: '2rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            background: '#F9FAFB'
                        }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                    gap: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                        {msg.type === 'agent' && <span style={{ color: msg.color }}>{msg.sender}</span>}
                                        {msg.type === 'user' && <span>Tú</span>}
                                    </div>
                                    <div className="markdown-content" style={{
                                        maxWidth: '85%',
                                        padding: '1.25rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: msg.type === 'user' ? 'var(--secondary)' : 'white',
                                        color: msg.type === 'user' ? 'white' : 'var(--text-main)',
                                        boxShadow: msg.type === 'agent' ? 'var(--shadow-sm)' : 'none',
                                        border: msg.type === 'agent' ? `1px solid ${msg.color}20` : 'none',
                                        lineHeight: 1.6
                                    }}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {(phase === 'user_turn' || phase === 'finished') && (
                            <div style={{ padding: '1.5rem', background: 'white', borderTop: '2px solid var(--primary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 600 }}>
                                    {phase === 'user_turn' ? (
                                        <><User size={18} /> Continúa la conversación:</>
                                    ) : (
                                        <><Bot size={18} /> El debate ha concluido. ¿Deseas aportar algo más o hacer otra pregunta?</>
                                    )}
                                </div>
                                <form onSubmit={handleUserSubmit} style={{ display: 'flex', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="Escribe tu mensaje aquí..."
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--accent)',
                                            outline: 'none'
                                        }}
                                        autoFocus
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={!userInput.trim()}>
                                        <Send size={18} /> Enviar
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes typing {
                    0% { opacity: 0.3; }
                    50% { opacity: 1; }
                    100% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default SwarmModule;
