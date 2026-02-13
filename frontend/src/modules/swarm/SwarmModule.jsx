import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { ArrowLeft, Play, Send, Bot, User, Brain, RefreshCcw, Sparkles, MessageSquare, MessagesSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SchemaInfoButton from '../../components/SchemaInfoButton';
import SwarmFlow from './components/SwarmFlow';
import './SwarmModule.css';

/* ── Fake "reasoning" lines shown while an agent is thinking ── */
const THINKING_PHRASES = [
    'Analizando el contexto del problema…',
    'Evaluando las perspectivas de los otros agentes…',
    'Considerando restricciones y oportunidades…',
    'Formulando mi posición basada en evidencia…',
    'Conectando datos con el historial del debate…',
    'Sintetizando una respuesta coherente…',
    'Revisando mis conclusiones antes de responder…',
];

const pickThinkingPhrase = () =>
    THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)];

const SwarmModule = () => {
    const { globalAppId, swarmConfig, apiConfig } = useConfig();

    // ── State ──
    const [phase, setPhase] = useState('input');        // input | debating | user_turn | summarizing | finished
    const [mode, setMode] = useState('single');          // single | discussion
    const [topic, setTopic] = useState('');
    const [messages, setMessages] = useState([]);
    const [thinkingAgent, setThinkingAgent] = useState(null);
    const [activeAgentId, setActiveAgentId] = useState(null);
    const [doneAgentIds, setDoneAgentIds] = useState(new Set());
    const [moderatorActive, setModeratorActive] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [discussionRound, setDiscussionRound] = useState(0);
    const messagesEndRef = useRef(null);
    const turnCountRef = useRef(0);
    const abortRef = useRef(false);

    const activeAgents = swarmConfig.agents.filter(a => a.isActive);
    const moderatorConfigured = !!swarmConfig.moderatorAgentId;

    // ── Scroll ──
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, thinkingAgent, scrollToBottom]);

    // ── Reset agents on mount ──
    const resetAgents = useCallback(async () => {
        try {
            const allToReset = [...activeAgents];
            if (swarmConfig.moderatorAgentId) {
                allToReset.push({ id: 'moderator', agentId: swarmConfig.moderatorAgentId });
            }
            await fetch(`${apiConfig.baseUrl}/api/swarm/reset_session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId: globalAppId, agents: allToReset }),
            });
        } catch (err) {
            console.error('Error resetting session:', err);
        }
    }, [activeAgents, swarmConfig.moderatorAgentId, apiConfig.baseUrl, globalAppId]);

    useEffect(() => {
        resetAgents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startDebate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        abortRef.current = false;
        setPhase('debating');
        const initial = { sender: 'Usuario', text: topic, type: 'user' };
        setMessages([initial]);
        turnCountRef.current = 0;
        setDoneAgentIds(new Set());
        setDiscussionRound(0);

        if (mode === 'discussion') {
            runDiscussionLoop(initial, [initial], 0);
        } else {
            runSwarmLoop(initial, [initial], 0);
        }
    };

    // ════════════════════ SINGLE MODE (Original) ════════════════════

    const runSwarmLoop = async (lastMsg, currentHistory, turnCount) => {
        if (abortRef.current) return;
        if (turnCount >= 10) {
            finishDebate();
            return;
        }
        turnCountRef.current = turnCount;

        setActiveAgentId(null);

        try {
            if (!moderatorConfigured) {
                const nextIdx = turnCount % activeAgents.length;
                processAgentTurn(activeAgents[nextIdx], currentHistory, turnCount, 'single');
                return;
            }

            // Show moderator is thinking
            setModeratorActive(true);

            const modRes = await fetch(`${apiConfig.baseUrl}/api/swarm/decide_next`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appId: globalAppId,
                    moderatorAgentId: swarmConfig.moderatorAgentId,
                    history: currentHistory.map(m => ({ sender: m.sender, text: m.text })),
                    availableAgents: activeAgents.map(a => ({ id: a.id, name: a.name, description: a.description })),
                    mode: 'single',
                    turnCount: turnCount,
                }),
            });

            setModeratorActive(false);

            if (!modRes.ok) throw new Error('Error en el moderador');
            const decision = await modRes.json();

            if (decision.next === 'fin') { finishDebate(); return; }
            if (decision.next === 'you') {
                setPhase('user_turn');
                return;
            }

            const nextAgent = activeAgents.find(a => a.id === decision.next)
                || activeAgents[turnCount % activeAgents.length];

            processAgentTurn(nextAgent, currentHistory, turnCount, 'single');
        } catch (err) {
            console.error('Moderator flow error:', err);
            setModeratorActive(false);
            finishDebate();
        }
    };

    // ════════════════════ DISCUSSION MODE (New) ════════════════════

    const runDiscussionLoop = async (_lastMsg, currentHistory, turnCount) => {
        if (abortRef.current) return;
        const MAX_DISCUSSION_TURNS = 10;

        if (turnCount >= MAX_DISCUSSION_TURNS) {
            summarizeDiscussion(currentHistory);
            return;
        }

        turnCountRef.current = turnCount;
        setActiveAgentId(null);

        try {
            if (!moderatorConfigured) {
                const nextIdx = turnCount % activeAgents.length;
                processAgentTurn(activeAgents[nextIdx], currentHistory, turnCount, 'discussion');
                return;
            }

            setModeratorActive(true);

            const modRes = await fetch(`${apiConfig.baseUrl}/api/swarm/decide_next`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appId: globalAppId,
                    moderatorAgentId: swarmConfig.moderatorAgentId,
                    history: currentHistory.map(m => ({ sender: m.sender, text: m.text })),
                    availableAgents: activeAgents.map(a => ({ id: a.id, name: a.name, description: a.description })),
                    mode: 'discussion',
                    turnCount: turnCount,
                }),
            });

            setModeratorActive(false);
            if (!modRes.ok) throw new Error('Error en el moderador');
            const decision = await modRes.json();

            if (decision.next === 'fin') {
                summarizeDiscussion(currentHistory);
                return;
            }

            const nextAgent = activeAgents.find(a => a.id === decision.next)
                || activeAgents[turnCount % activeAgents.length];

            processAgentTurn(nextAgent, currentHistory, turnCount, 'discussion');
        } catch (err) {
            console.error('Discussion moderator error:', err);
            setModeratorActive(false);
            summarizeDiscussion(currentHistory);
        }
    };

    // ════════════════════ SHARED: Process Agent Turn ════════════════════

    const processAgentTurn = async (agent, currentHistory, turnCount, currentMode) => {
        if (abortRef.current) return;
        setActiveAgentId(agent.id);

        // Show "thinking" indicator in the chat
        setThinkingAgent({
            name: agent.name,
            color: agent.color,
            phrase: pickThinkingPhrase(),
        });

        try {
            const response = await fetch(`${apiConfig.baseUrl}/api/swarm/process_turn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appId: globalAppId,
                    agent,
                    history: currentHistory,
                    userPrompt: turnCount === 0 ? topic : '',
                }),
            });

            if (abortRef.current) return;
            if (!response.ok) throw new Error('Error en el turno del agente');
            const data = await response.json();

            // Clear thinking, commit message directly
            setThinkingAgent(null);

            const newMessage = {
                sender: agent.name,
                text: data.response,
                agentId: agent.agentId,
                color: agent.color,
                type: 'agent',
            };

            const nextHistory = [...currentHistory, newMessage];
            setMessages((msgs) => [...msgs, newMessage]);

            // Mark agent as done
            setDoneAgentIds((prev) => {
                const next = new Set(prev);
                next.add(agent.id);
                return next;
            });

            setDiscussionRound(prev => prev + 1);

            // Decide what happens next based on mode
            if (currentMode === 'discussion') {
                // In discussion mode: continue the loop automatically
                setTimeout(() => {
                    setActiveAgentId(null);
                    runDiscussionLoop(newMessage, nextHistory, turnCount + 1);
                }, 600);
            } else {
                // In single mode: expert answered → give control back to user
                setTimeout(() => {
                    setActiveAgentId(null);
                    setPhase('user_turn');
                }, 600);
            }
        } catch (err) {
            console.error('Turn error:', err);
            setThinkingAgent(null);
            if (currentMode === 'discussion') {
                summarizeDiscussion(currentHistory);
            } else {
                finishDebate();
            }
        }
    };

    // ════════════════════ DISCUSSION: Summarize ════════════════════

    const summarizeDiscussion = async (currentHistory) => {
        if (abortRef.current) return;
        setPhase('summarizing');
        setActiveAgentId(null);
        setModeratorActive(true);
        setThinkingAgent({
            name: 'Moderador',
            color: '#F85900',
            phrase: 'Sintetizando las conclusiones del debate…',
        });

        try {
            const res = await fetch(`${apiConfig.baseUrl}/api/swarm/discussion_summarize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appId: globalAppId,
                    moderatorAgentId: swarmConfig.moderatorAgentId,
                    history: currentHistory.map(m => ({ sender: m.sender, text: m.text })),
                    userPrompt: topic,
                }),
            });

            setThinkingAgent(null);
            setModeratorActive(false);

            if (!res.ok) throw new Error('Error al resumir');
            const data = await res.json();

            const summaryMsg = {
                sender: 'Moderador — Síntesis Final',
                text: data.summary,
                type: 'summary',
                color: '#F85900',
            };

            setMessages(msgs => [...msgs, summaryMsg]);
            setPhase('finished');
        } catch (err) {
            console.error('Summarize error:', err);
            setThinkingAgent(null);
            setModeratorActive(false);
            finishDebate();
        }
    };

    const handleUserSubmit = (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const newMsg = { sender: 'Usuario', text: userInput, type: 'user' };
        const nextHistory = [...messages, newMsg];
        setMessages(nextHistory);
        setUserInput('');
        setPhase('debating');

        if (mode === 'discussion') {
            runDiscussionLoop(newMsg, nextHistory, 0);
        } else {
            runSwarmLoop(newMsg, nextHistory, 0);
        }
    };

    const finishDebate = () => {
        setActiveAgentId(null);
        setModeratorActive(false);
        setThinkingAgent(null);
        setPhase('finished');
    };

    const reset = () => {
        abortRef.current = true;
        setPhase('input');
        setTopic('');
        setMessages([]);
        setThinkingAgent(null);
        setActiveAgentId(null);
        setDoneAgentIds(new Set());
        setModeratorActive(false);
        setDiscussionRound(0);
        turnCountRef.current = 0;
        resetAgents();
    };

    // ════════════════════ RENDER ════════════════════

    return (
        <div className="swarm-container">
            {/* ── Header ── */}
            <div className="swarm-header">
                <div className="swarm-header-left">
                    <Link to="/" className="btn" style={{ background: 'var(--accent)', padding: '0.5rem' }}>
                        <ArrowLeft size={20} color="var(--text-main)" />
                    </Link>
                    <div className="swarm-header-title">
                        <h2>{swarmConfig.title}</h2>
                        <span>Multi-Agent Collaboration</span>
                    </div>
                    <SchemaInfoButton moduleId="swarm" />
                </div>
                {phase !== 'input' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`swarm-mode-badge swarm-mode-badge--${mode}`}>
                            {mode === 'single' ? (
                                <><MessageSquare size={14} /> Consulta directa</>
                            ) : (
                                <><MessagesSquare size={14} /> Mesa de debate</>
                            )}
                        </span>
                        {mode === 'discussion' && phase === 'debating' && (
                            <span className="swarm-round-badge">
                                Turno {discussionRound}
                            </span>
                        )}
                        <button onClick={reset} className="btn" style={{ background: 'var(--accent)', fontSize: '0.9rem' }}>
                            <RefreshCcw size={16} /> Reiniciar
                        </button>
                    </div>
                )}
            </div>

            {/* ══════════ INPUT PHASE ══════════ */}
            {phase === 'input' && (
                <div className="swarm-input-card">
                    <div className="swarm-input-icon">
                        <Brain size={40} />
                    </div>
                    <h3>Plantea un Reto al Equipo</h3>
                    <p>
                        Ingresa un problema de negocio, técnico o social.
                        Nuestro equipo de IAs especializadas debatirá para darte una perspectiva 360º.
                    </p>

                    {/* ── Mode Selector ── */}
                    <div className="swarm-mode-selector">
                        <button
                            type="button"
                            className={`swarm-mode-option ${mode === 'single' ? 'swarm-mode-option--active' : ''}`}
                            onClick={() => setMode('single')}
                        >
                            <MessageSquare size={22} />
                            <div className="swarm-mode-option__text">
                                <strong>Consulta Directa</strong>
                                <span>Un experto responde, tú sigues conversando</span>
                            </div>
                        </button>
                        <button
                            type="button"
                            className={`swarm-mode-option ${mode === 'discussion' ? 'swarm-mode-option--active' : ''}`}
                            onClick={() => setMode('discussion')}
                        >
                            <MessagesSquare size={22} />
                            <div className="swarm-mode-option__text">
                                <strong>Mesa de Debate</strong>
                                <span>Los expertos debaten entre sí hasta una conclusión</span>
                            </div>
                        </button>
                    </div>

                    <form onSubmit={startDebate} className="swarm-input-form">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ej: ¿Cómo optimizar la logística urbana usando IA?"
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }} disabled={!topic.trim()}>
                            <Play size={20} /> Iniciar
                        </button>
                    </form>

                    <div className="swarm-agent-avatars">
                        {activeAgents.map(agent => (
                            <div key={agent.id} className="swarm-agent-avatar">
                                <div className="swarm-agent-avatar-circle" style={{ background: agent.color }}>
                                    <Bot size={22} />
                                </div>
                                <span>{agent.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════════ DEBATE PHASE ══════════ */}
            {phase !== 'input' && (
                <div className="swarm-stage">
                    {/* ── Chat Log (left) ── */}
                    <div className="swarm-chat-panel">
                        <div className="swarm-chat-messages">
                            {/* Confirmed messages */}
                            {messages.map((msg, i) => (
                                <div key={i} className={`swarm-msg swarm-msg--${msg.type}`}>
                                    <div className="swarm-msg__sender">
                                        {msg.type === 'agent' && (
                                            <>
                                                <span style={{
                                                    width: 8, height: 8,
                                                    borderRadius: '50%',
                                                    background: msg.color,
                                                    display: 'inline-block',
                                                }} />
                                                <span style={{ color: msg.color }}>{msg.sender}</span>
                                            </>
                                        )}
                                        {msg.type === 'summary' && (
                                            <>
                                                <span style={{
                                                    width: 8, height: 8,
                                                    borderRadius: '50%',
                                                    background: msg.color,
                                                    display: 'inline-block',
                                                }} />
                                                <span style={{ color: msg.color, fontWeight: 700 }}>{msg.sender}</span>
                                            </>
                                        )}
                                        {msg.type === 'user' && <span>Tú</span>}
                                    </div>
                                    <div
                                        className={`swarm-msg__bubble markdown-content ${msg.type === 'summary' ? 'swarm-msg__bubble--summary' : ''}`}
                                        style={msg.type === 'agent' ? { borderLeft: `3px solid ${msg.color}` }
                                            : msg.type === 'summary' ? { borderLeft: `4px solid ${msg.color}`, background: 'linear-gradient(135deg, #fff8f3, #fff)' }
                                            : {}}
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}

                            {/* Thinking indicator (shown while waiting for API) */}
                            {thinkingAgent && (
                                <div className="swarm-thinking">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxWidth: '75%' }}>
                                        <div className="swarm-thinking__label" style={{ color: thinkingAgent.color }}>
                                            <Sparkles size={14} />
                                            {thinkingAgent.name} está razonando…
                                        </div>
                                        <div className="swarm-thinking__bubble">
                                            {thinkingAgent.phrase}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Summarizing indicator */}
                            {phase === 'summarizing' && !thinkingAgent && (
                                <div className="swarm-thinking">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxWidth: '75%' }}>
                                        <div className="swarm-thinking__label" style={{ color: '#F85900' }}>
                                            <Brain size={14} />
                                            El moderador está preparando la síntesis final…
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input bar */}
                        {(phase === 'user_turn' || phase === 'finished') && (
                            <div className="swarm-input-bar">
                                <div className="swarm-input-bar__label">
                                    {phase === 'user_turn' ? (
                                        <><User size={18} /> Continúa la conversación:</>
                                    ) : (
                                        <><Bot size={18} /> {mode === 'discussion' ? 'El debate ha concluido con una síntesis. ¿Algo más?' : 'El debate ha concluido. ¿Algo más?'}</>
                                    )}
                                </div>
                                <form onSubmit={handleUserSubmit}>
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="Escribe tu mensaje aquí…"
                                        autoFocus
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={!userInput.trim()}>
                                        <Send size={18} /> Enviar
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* ── React Flow Graph (right) ── */}
                    <div className="swarm-flow-panel">
                        <SwarmFlow
                            agents={activeAgents}
                            activeAgentId={activeAgentId}
                            doneAgentIds={doneAgentIds}
                            moderatorActive={moderatorActive}
                            moderatorConfigured={moderatorConfigured}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SwarmModule;
