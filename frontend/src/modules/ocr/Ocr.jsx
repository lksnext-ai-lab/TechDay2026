import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, FileText, Check, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const Ocr = () => {
    const [state, setState] = useState('idle'); // idle, scanning, result
    const videoRef = useRef(null);

    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                // Fallback or error handling could go here
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        setState('scanning');
        setTimeout(() => {
            setState('result');
        }, 2500);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/" className="btn" style={{ background: 'var(--accent)', padding: '0.5rem' }}>
                    <ArrowLeft size={20} color="var(--text-main)" />
                </Link>
                <h2 style={{ margin: 0, color: 'var(--primary)' }}>Digitalización Inteligente (OCR)</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Camera Source */}
                <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '500px' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Camera size={20} /> Fuente de Entrada
                    </h3>

                    <div style={{
                        flex: 1,
                        background: '#000',
                        borderRadius: 'var(--radius-sm)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Real Webcam View */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: 'scaleX(-1)' // Mirror effect
                            }}
                        />

                        {/* Scanning Animation Overlay */}
                        {state === 'scanning' && (
                            <div className="scanner-line" style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, height: '4px',
                                background: '#00ff00',
                                boxShadow: '0 0 10px #00ff00',
                                zIndex: 10
                            }} />
                        )}
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', width: '100%' }}
                        onClick={handleCapture}
                        disabled={state === 'scanning'}
                    >
                        {state === 'scanning' ? 'Procesando...' : 'Capturar y Analizar'}
                    </button>
                </div>

                {/* Results */}
                <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '500px' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} /> Datos Extraídos
                    </h3>

                    {state === 'idle' && (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            textAlign: 'center',
                            padding: '2rem'
                        }}>
                            Capture una imagen para extraer información estructurada.
                        </div>
                    )}

                    {state === 'scanning' && (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)'
                        }}>
                            <Loader className="spin" size={40} />
                            <p style={{ marginTop: '1rem' }}>Interpretando documento...</p>
                        </div>
                    )}

                    {state === 'result' && (
                        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                padding: '1rem',
                                background: '#f8f9fa',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid #dee2e6',
                                flex: 1,
                                overflowY: 'auto'
                            }}>
                                <div className="field-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tipo Documento</label>
                                    <div style={{ fontWeight: 'bold' }}>Factura Proveedor</div>
                                </div>
                                <div className="field-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NIF / CIF</label>
                                    <div style={{ fontFamily: 'monospace', background: '#e9ecef', padding: '0.2rem 0.5rem', borderRadius: '4px', width: 'fit-content' }}>B-12345678</div>
                                </div>
                                <div className="field-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fecha Factura</label>
                                    <div>27/12/2025</div>
                                </div>
                                <div className="field-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Concepto Principal</label>
                                    <div>Servicios Consultoría Tecnológica</div>
                                </div>
                                <div className="field-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Base Imponible</label>
                                    <div>1.500,00 €</div>
                                </div>
                                <div className="field-group">
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total</label>
                                    <div style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>1.815,00 €</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'green', fontSize: '0.9rem' }}>
                                <Check size={16} />
                                <span>Exportado automáticamente a ERP</span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            <style>{`
        .scanner-line {
          animation: scan 2s linear infinite;
        }
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default Ocr;
