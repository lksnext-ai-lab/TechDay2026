import React, { useState } from 'react';
import { ArrowLeft, Search, CheckCircle, AlertTriangle, Activity, Database, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sat = () => {
    const [step, setStep] = useState('input'); // input, analyzing, result
    const [serial, setSerial] = useState('');
    const [logs, setLogs] = useState([]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!serial.trim()) return;
        setStep('analyzing');

        // Simulate analysis steps
        const simulationSteps = [
            "Conectando con dispositivo remoto...",
            "Descargando telemetría de las últimas 24h...",
            "Analizando patrones de vibración...",
            "Consultando base de conocimiento técnica...",
            "Generando diagnóstico mediante IA..."
        ];

        let delay = 0;
        simulationSteps.forEach((log, index) => {
            delay += 1000;
            setTimeout(() => {
                setLogs(prev => [...prev, log]);
                if (index === simulationSteps.length - 1) {
                    setTimeout(() => setStep('result'), 1000);
                }
            }, delay);
        });
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/" className="btn" style={{ background: 'var(--accent)', padding: '0.5rem' }}>
                    <ArrowLeft size={20} color="var(--text-main)" />
                </Link>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--primary)' }}>Soporte Técnico Inteligente</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Diagnóstico preventivo basado en IA</p>
                </div>
            </div>

            <div style={{
                background: 'var(--bg-main)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                padding: '2rem',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>

                {step === 'input' && (
                    <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
                        <WrenchIcon large />
                        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Ingrese Nª de Serie</h3>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                            Identifique la máquina para iniciar el diagnóstico remoto.
                        </p>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Ej: LKS-mach-2024-X"
                                value={serial}
                                onChange={(e) => setSerial(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--accent)',
                                    fontSize: '1rem'
                                }}
                            />
                            <button type="submit" className="btn btn-primary">
                                <Search size={20} /> Analizar
                            </button>
                        </form>
                    </div>
                )}

                {step === 'analyzing' && (
                    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Ejecutando Diagnóstico IA</h3>
                        <div style={{
                            background: '#1a1a1a',
                            color: '#00ff00',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'monospace',
                            height: '300px',
                            overflowY: 'auto'
                        }}>
                            {logs.map((log, i) => (
                                <div key={i} style={{ marginBottom: '0.5rem' }}>{`> ${log}`}</div>
                            ))}
                            <div className="blink">_</div>
                        </div>
                    </div>
                )}

                {step === 'result' && (
                    <div className="fade-in">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            background: '#e6f4ea',
                            padding: '1rem',
                            borderRadius: 'var(--radius-sm)',
                            color: '#1e7e34',
                            marginBottom: '2rem'
                        }}>
                            <CheckCircle size={24} />
                            <span style={{ fontWeight: 'bold' }}>Diagnóstico Completado</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Activity size={20} /> Estado Actual
                                </h4>
                                <div style={{ padding: '1rem', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Temperatura Motor:</span>
                                        <span style={{ color: 'orange', fontWeight: 'bold' }}>85°C (Alto)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Vibración Eje Z:</span>
                                        <span style={{ color: 'green', fontWeight: 'bold' }}>0.02 mm/s (Normal)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Ciclos Totales:</span>
                                        <span style={{ fontWeight: 'bold' }}>1,245,032</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B00020' }}>
                                    <AlertTriangle size={20} /> Predicción de Fallo
                                </h4>
                                <div style={{ padding: '1rem', background: '#ffebee', borderRadius: 'var(--radius-sm)', color: '#b71c1c' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Riesgo Crítico Detectado</p>
                                    <p style={{ fontSize: '0.9rem' }}>
                                        El modelo predictivo indica un 87% de probabilidad de fallo en rodamientos en las próximas 48 horas debido al patrón térmico.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Acciones Recomendadas (Generadas por IA)</h4>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-offset)', borderRadius: 'var(--radius-sm)' }}>
                                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                                    <li>Programar parada técnica para lubricación de eje principal.</li>
                                    <li>Revisar alineación de acoplamiento.</li>
                                    <li>Solicitar repuesto REF-4592 (Stock disponible: 2 uds).</li>
                                </ul>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <button className="btn btn-primary" onClick={() => { setStep('input'); setLogs([]); setSerial(''); }}>
                                        Nueva Consulta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            <style>{`
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; } }
      `}</style>
        </div>
    );
};

const WrenchIcon = ({ large }) => (
    <div style={{
        width: large ? '80px' : '40px',
        height: large ? '80px' : '40px',
        background: '#003366',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        margin: '0 auto'
    }}>
        <Database size={large ? 40 : 20} />
    </div>
);

export default Sat;
