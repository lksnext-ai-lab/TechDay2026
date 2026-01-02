import React, { useState, useEffect, useRef } from 'react';
import { Send, Gift, Play, ArrowLeft, Bot, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const FLOW_STEPS = [
    { id: 'intro', text: "¡Hola! ¿Qué te ha parecido el LKS Tech Day? (Del 1 al 10)" },
    { id: 'opinion', text: "Gracias. ¿Qué es lo que más te ha gustado? (Escribe brevemente)" },
    { id: 'name', text: "¡Genial! Para participar en el sorteo de una Tablet, indícanos tu nombre." },
    { id: 'email', text: "Un último paso. ¿Cuál es tu email corporativo?" },
    { id: 'done', text: "¡Perfecto! Ya estás participando. ¡Mucha suerte!" }
];

const Sorteo = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: FLOW_STEPS[0].text, sender: 'bot' }
    ]);
    const [currentStep, setCurrentStep] = useState(0);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [completed, setCompleted] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { id: Date.now(), text: input, sender: 'user' }]);
        setInput('');
        setIsTyping(true);

        // Bot logic
        setTimeout(() => {
            const nextStepIndex = currentStep + 1;

            if (nextStepIndex < FLOW_STEPS.length) {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: FLOW_STEPS[nextStepIndex].text, sender: 'bot' }]);
                setCurrentStep(nextStepIndex);
                if (FLOW_STEPS[nextStepIndex].id === 'done') {
                    setCompleted(true);
                }
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "Ya tenemos tus datos. ¡Gracias!", sender: 'bot' }]);
            }
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/" className="btn" style={{ background: 'var(--accent)', padding: '0.5rem' }}>
                    <ArrowLeft size={20} color="var(--text-main)" />
                </Link>
                <h2 style={{ margin: 0, color: '#6f42c1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gift size={24} /> Sorteo Tech Day
                </h2>
            </div>

            <div style={{
                flex: 1,
                background: 'var(--bg-main)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    backgroundColor: '#f3e5f5' // Light purple tint
                }}>
                    {messages.map((msg) => (
                        <div key={msg.id} style={{
                            display: 'flex',
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            gap: '0.75rem',
                            alignItems: 'flex-start'
                        }}>
                            {msg.sender === 'bot' && (
                                <div style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '50%',
                                    background: '#6f42c1',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <Bot size={18} />
                                </div>
                            )}

                            <div style={{
                                maxWidth: '70%',
                                padding: '1rem',
                                borderRadius: '1rem',
                                borderTopLeftRadius: msg.sender === 'bot' ? '0' : '1rem',
                                borderTopRightRadius: msg.sender === 'user' ? '0' : '1rem',
                                background: msg.sender === 'user' ? '#6f42c1' : 'white',
                                color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                                boxShadow: msg.sender === 'bot' ? 'var(--shadow-sm)' : 'none',
                                lineHeight: '1.5'
                            }}>
                                {msg.text}
                            </div>

                            {msg.sender === 'user' && (
                                <div style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '50%',
                                    background: '#4a148c',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <User size={18} />
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '50%',
                                background: '#6f42c1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white'
                            }}>
                                <Bot size={18} />
                            </div>
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', borderTopLeftRadius: 0, boxShadow: 'var(--shadow-sm)' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Guardando respuesta...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {!completed && (
                    <form onSubmit={handleSend} style={{
                        padding: '1rem',
                        borderTop: '1px solid var(--accent)',
                        background: 'white',
                        display: 'flex',
                        gap: '1rem'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Responde aquí..."
                            autoFocus
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--accent)',
                                fontSize: '1rem',
                                outline: 'none',
                                borderColor: '#6f42c1'
                            }}
                        />
                        <button type="submit" className="btn" style={{ padding: '0.75rem', background: '#6f42c1', color: 'white' }} disabled={!input.trim()}>
                            <Send size={20} />
                        </button>
                    </form>
                )}
                {completed && (
                    <div style={{ padding: '1.5rem', textAlign: 'center', background: 'white', color: '#28a745' }}>
                        <CheckCircleIcon />
                        <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>¡Registro Completado!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CheckCircleIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default Sorteo;
