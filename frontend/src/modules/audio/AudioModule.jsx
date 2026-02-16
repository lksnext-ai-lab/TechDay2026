import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Play, Pause, FileAudio, Loader2, CheckCircle2, AlertCircle, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './AudioModule.css';
import { useConfig } from '../../context/ConfigContext';
import SchemaInfoButton from '../../components/SchemaInfoButton';

const AudioModule = () => {
    const { apiConfig, globalAppId, audioConfig } = useConfig();
    const API_BASE_URL = apiConfig.baseUrl || 'http://localhost:8001';

    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [transcription, setTranscription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/audio/transcriptions`);
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                // Create a File object from the blob
                const file = new File([audioBlob], "recording.webm", { type: 'audio/webm' });
                setAudioFile(file);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setError(null);
            setTranscription(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("No se pudo acceder al micrófono.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release the microphone
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAudioFile(file);
            setAudioUrl(URL.createObjectURL(file));
            setTranscription(null);
            setError(null);
        }
    };

    const handleTranscribe = async () => {
        if (!audioFile) return;

        // Validate configuration
        if (!globalAppId || !audioConfig?.agentId) {
            setError("Por favor, configura el App ID y Agent ID para Audio en la página de configuración.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // 1. Upload the file
            const formData = new FormData();
            formData.append('file', audioFile);

            const uploadResponse = await fetch(`${API_BASE_URL}/api/audio/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) throw new Error("Error al subir el audio");
            const uploadData = await uploadResponse.json();

            // 2. Request transcription from Mattin AI
            const transcribeResponse = await fetch(`${API_BASE_URL}/api/audio/transcribe/${uploadData.id}?app_id=${globalAppId}&agent_id=${audioConfig.agentId}`, {
                method: 'POST',
            });

            if (!transcribeResponse.ok) throw new Error("Error al transcribir el audio");
            const transcriptionData = await transcribeResponse.json();

            setTranscription(transcriptionData);
            fetchHistory(); // Refresh history
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (event, transcriptionId) => {
        event.stopPropagation(); // Prevent loading the transcription when clicking delete

        if (!window.confirm("¿Estás seguro de que quieres borrar esta transcripción?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/audio/transcription/${transcriptionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error("Error al borrar la transcripción");

            // If we deleted the one currently shown, clear it
            if (transcription && transcription.id === transcriptionId) {
                setTranscription(null);
                setAudioUrl(null);
                setAudioFile(null);
            }

            fetchHistory();
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const getSentimentIcon = (sentiment) => {
        switch (sentiment) {
            case 'positive': return <span className="sentiment-tag positive">😊 Positivo</span>;
            case 'negative': return <span className="sentiment-tag negative">😞 Negativo</span>;
            default: return <span className="sentiment-tag neutral">😐 Neutral</span>;
        }
    };

    return (
        <div className="audio-module">
            <div className="module-header" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <Link to="/" className="btn" style={{ background: 'var(--accent)', padding: '0.5rem' }}>
                        <ArrowLeft size={20} color="var(--text-main)" />
                    </Link>
                    <h1 style={{ margin: 0, flex: 1 }}>Transcripción de Audio</h1>
                    <SchemaInfoButton moduleId="audio" />
                </div>
                <p>Graba o sube un archivo de audio para que Mattin AI lo transcriba y analice.</p>
            </div>

            <div className="main-grid">
                <section className="interaction-card">
                    <div className="controls-group">
                        <h3>Grabar Audio</h3>
                        <div className="recorder-controls">
                            {!isRecording ? (
                                <button className="btn-record" onClick={startRecording}>
                                    <Mic size={24} />
                                    <span>Iniciar Grabación</span>
                                </button>
                            ) : (
                                <button className="btn-stop" onClick={stopRecording}>
                                    <Square size={24} />
                                    <span>Detener Grabación</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="divider"><span>O</span></div>

                    <div className="controls-group">
                        <h3>Subir Archivo</h3>
                        <label className="file-upload-label">
                            <Upload size={24} />
                            <span>Seleccionar archivo</span>
                            <input type="file" accept="audio/*" onChange={handleFileUpload} hidden />
                        </label>
                        {audioFile && !isRecording && (
                            <div className="file-selected">
                                <FileAudio size={18} />
                                <span>{audioFile.name}</span>
                            </div>
                        )}
                    </div>

                    {audioUrl && (
                        <div className="playback-section">
                            <h3>Escuchar Audio</h3>
                            <audio ref={audioRef} src={audioUrl} controls className="audio-player" />
                            <button
                                className="btn-primary transcribe-btn"
                                onClick={handleTranscribe}
                                disabled={loading || isRecording}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                                <span>{loading ? "Transcribiendo..." : "Transcribir con Mattin AI"}</span>
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {transcription && (
                        <div className="result-card animate-fade-in">
                            <div className="result-header">
                                <h3>Resultado de la Transcripción</h3>
                                {getSentimentIcon(transcription.sentiment)}
                            </div>
                            <div className="transcription-text">
                                {transcription.content}
                            </div>
                        </div>
                    )}
                </section>

                <section className="history-section">
                    <h3>Historial Reciente</h3>
                    <div className="history-list">
                        {history.length === 0 ? (
                            <p className="empty-history">No hay transcripciones previas.</p>
                        ) : (
                            history.map((item) => (
                                <div key={item.id} className="history-item" onClick={() => {
                                    setTranscription(item);
                                    setAudioUrl(`${API_BASE_URL}/api/audio/file/${item.filename}`);
                                    setAudioFile(null); // Clear selected file to show the history one
                                }}>
                                    <div className="history-item-info">
                                        <span className="history-date">
                                            {new Date(item.created_at).toLocaleString()}
                                        </span>
                                        <p className="history-preview">
                                            {item.content ? item.content.substring(0, 50) + "..." : "Sin transcripción"}
                                        </p>
                                    </div>
                                    <div className="history-item-actions">
                                        {item.sentiment && (
                                            <div className={`sentiment-indicator ${item.sentiment}`}></div>
                                        )}
                                        <button className="btn-delete-small" onClick={(e) => handleDelete(e, item.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AudioModule;
