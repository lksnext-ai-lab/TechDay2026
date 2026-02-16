import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { ArrowLeft, Camera, FileText, Check, Loader, TriangleAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import SchemaInfoButton from '../../components/SchemaInfoButton';

const Ocr = () => {
    const { apiConfig, globalAppId, ocrConfig } = useConfig();
    const [state, setState] = useState('idle'); // idle, scanning, result, error
    const [resultData, setResultData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [capturedImage, setCapturedImage] = useState(null);
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

    const captureImage = () => {
        if (!videoRef.current) return null;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const ctx = canvas.getContext('2d');
        // We mirror the video in CSS, but for capture we might want it mirrored or normal
        // Usually OCR expects normal text, but if the user sees it mirrored, they might align it weirdly.
        // Let's draw it normally (unmirrored) which is what the camera actually sees.
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const dataUrl = canvas.toDataURL('image/jpeg');
                resolve({ blob, dataUrl });
            }, 'image/jpeg', 0.9);
        });
    };

    const handleCapture = async () => {
        if (!globalAppId || !ocrConfig.agentId) {
            console.error("DEBUG: Missing Config. AppID:", globalAppId, "AgentID:", ocrConfig.agentId);
            setErrorMsg("No hay App ID o Agent ID configurados. Ve a Ajustes > OCR.");
            setState('error');
            return;
        }

        setState('scanning');
        setErrorMsg('');
        setResultData(null);

        try {
            const { blob: imageBlob, dataUrl } = await captureImage();
            if (!imageBlob) {
                console.error("DEBUG: Capture failed, blob is null");
                throw new Error("No se pudo capturar la imagen de la cámara.");
            }
            // Freeze the image
            setCapturedImage(dataUrl);

            console.log(`DEBUG: Image Captured. Size: ${imageBlob.size} bytes, Type: ${imageBlob.type}`);

            const formData = new FormData();
            formData.append('files', imageBlob, 'capture.jpg');
            formData.append('message', 'Analiza esta imagen y extrae los datos clave.');

            const url = `${apiConfig.baseUrl}/public/v1/app/${globalAppId}/chat/${ocrConfig.agentId}/call`;
            console.log("DEBUG: Sending to:", url);

            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            console.log("DEBUG: Response status:", response.status);

            if (!response.ok) {
                const errText = await response.text();
                console.error("DEBUG: Response Error:", errText);
                throw new Error(`Error del servidor: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            console.log("DEBUG: Response Data:", data);

            let responseContent = data.response;
            if (typeof responseContent === 'object' && responseContent !== null) {
                responseContent = "```json\n" + JSON.stringify(responseContent, null, 2) + "\n```";
            }
            setResultData(responseContent);
            setState('result');

        } catch (error) {
            console.error("OCR Error:", error);
            setErrorMsg(error.message || "Error al procesar la imagen.");
            setState('error');
        }
    };

    const resetState = () => {
        setState('idle');
        setCapturedImage(null);
        setResultData(null);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/" className="btn" style={{ background: 'var(--accent)', padding: '0.5rem' }}>
                    <ArrowLeft size={20} color="var(--text-main)" />
                </Link>
                <h2 style={{ margin: 0, color: 'var(--primary)', flex: 1 }}>Digitalización Inteligente (OCR)</h2>
                <SchemaInfoButton moduleId="ocr" />
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

                        {/* Frozen Captured Image */}
                        {capturedImage && (
                            <img
                                src={capturedImage}
                                alt="Captured"
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0, width: '100%', height: '100%',
                                    objectFit: 'cover',
                                    transform: 'scaleX(-1)', // Match video mirror
                                    zIndex: 50
                                }}
                            />
                        )}

                        {/* Scanning Animation Overlay */}
                        {state === 'scanning' && (
                            <div className="scanner-line" style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, height: '4px',
                                background: '#00ff00',
                                boxShadow: '0 0 10px #00ff00',
                                zIndex: 200,
                                pointerEvents: 'none'
                            }} />
                        )}
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', width: '100%' }}
                        onClick={state === 'result' ? resetState : handleCapture}
                        disabled={state === 'scanning'}
                    >
                        {state === 'scanning' ? 'Procesando...' : state === 'result' ? 'Continuar' : 'Capturar y Analizar'}
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

                    {state === 'error' && (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent)',
                            textAlign: 'center',
                            padding: '2rem'
                        }}>
                            <TriangleAlert size={48} color="#e53e3e" style={{ marginBottom: '1rem' }} />
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#c53030' }}>Error</h4>
                            <p>{errorMsg}</p>
                            <button
                                className="btn"
                                onClick={() => {
                                    setState('idle');
                                    setCapturedImage(null);
                                }}
                                style={{ marginTop: '1rem', border: '1px solid #c53030', color: '#c53030' }}
                            >
                                Intentar de nuevo
                            </button>
                        </div>
                    )}

                    {state === 'result' && resultData && (
                        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className="markdown-content" style={{
                                padding: '1rem',
                                background: '#f8f9fa',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid #dee2e6',
                                flex: 1,
                                overflowY: 'auto'
                            }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {resultData}
                                </ReactMarkdown>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'green', fontSize: '0.9rem' }}>
                                <Check size={16} />
                                <span>Análisis completado</span>
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
                  0% { top: 0%; }
                  50% { top: 100%; }
                  100% { top: 0%; }
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
              `}</style>
        </div>
    );
};

export default Ocr;
