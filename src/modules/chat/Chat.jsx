import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_RESPONSES = {
    default: "Interesante pregunta. En LKS Next estamos aplicando IA Generativa para resolver este tipo de retos. ¿Te gustaría saber más sobre nuestros casos de éxito?",
    hola: "¡Hola! Bienvenido al stand de LKS Next en el Tech Day. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
    "tech day": "El Tech Day es una oportunidad fantástica para conectar y descubrir las últimas tendencias tecnológicas. ¡Espero que estés disfrutando!",
    "ia": "La Inteligencia Artificial es uno de los pilares de nuestra estrategia digital. Ayudamos a empresas a integrar modelos LLM en sus procesos.",
    "lks": "LKS Next es una consultora tecnológica líder. Acompañamos a nuestros clientes en su transformación digital con cercanía y compromiso.",
    "ayuda": "Puedo explicarte qué hacemos en IA, contarte sobre LKS Next o simplemente charlar. ¡Prueba a preguntarme algo!",
    "adios": "¡Hasta pronto! Disfruta del evento.",
    "gracias": "¡De nada! Estamos aquí para ayudar."
};

const Chat = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: MOCK_RESPONSES['hola'], sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Mock response logic
        setTimeout(() => {
            const lowerInput = userMessage.text.toLowerCase();
            let responseText = MOCK_RESPONSES.default;

            for (const [key, value] of Object.entries(MOCK_RESPONSES)) {
                if (lowerInput.includes(key)) {
                    responseText = value;
                    break;
                }
            }

            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, text: responseText, sender: 'bot' }
            ]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/" className="btn" style={{ background: 'var(--accent)', padding: '0.5rem' }}>
                    <ArrowLeft size={20} color="var(--text-main)" />
                </Link>
                <h2 style={{ margin: 0, color: 'var(--primary)' }}>Asistente IA</h2>
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
                    backgroundColor: '#FAFAFA'
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
                                    background: 'var(--primary)',
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
                                background: msg.sender === 'user' ? 'var(--secondary)' : 'white',
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
                                    background: 'var(--secondary)',
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
                                background: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white'
                            }}>
                                <Bot size={18} />
                            </div>
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', borderTopLeftRadius: 0, boxShadow: 'var(--shadow-sm)' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Escribiendo...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

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
                        placeholder="Escribe tu mensaje..."
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--accent)',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }} disabled={!input.trim()}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
