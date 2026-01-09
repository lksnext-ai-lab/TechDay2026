import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, FileText, Download, Trash2 } from 'lucide-react';
import { satService, API_BASE_URL } from '../services/satService';
import { useConfig } from '../../../context/ConfigContext';

const MachineDetail = ({ machineId, onBack }) => {
    const [formData, setFormData] = useState({
        id: '',
        type: '',
        brand: '',
        model: '',
        serial: '',
        available: true
    });
    const { globalAppId, satConfig } = useConfig();
    const [documents, setDocuments] = useState([]);
    const [actionStatus, setActionStatus] = useState(null); // { type: 'success'|'error'|'loading', message: '' }
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const isEditing = !!machineId;

    useEffect(() => {
        if (isEditing) {
            loadMachine();
            loadDocuments();
        }
    }, [machineId]);

    const loadDocuments = async () => {
        try {
            const docs = await satService.getMachineDocuments(machineId);
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Solo se permiten archivos PDF');
            return;
        }

        setUploading(true);
        try {
            await satService.uploadMachineDocument(machineId, file);
            await loadDocuments();
            e.target.value = null; // Reset input
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Error al subir el documento');
        } finally {
            setUploading(false);
        }
    };

    const loadMachine = async () => {
        setLoading(true);
        try {
            const machines = await satService.getMachines();
            const machine = machines.find(m => m.id === machineId);
            if (machine) {
                setFormData(machine);
            } else {
                alert('Modelo no encontrado');
                onBack();
            }
        } catch (error) {
            console.error(error);
            alert('Error al cargar el modelo');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEditing) {
                await satService.updateMachine(machineId, formData);
            } else {
                await satService.createMachine(formData);
            }
            onBack();
        } catch (error) {
            console.error(error);
            alert('Error al guardar. Compruebe que el ID y la Serie sean únicos.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-main)' }}>Cargando...</div>;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onBack}
                    className="btn"
                    style={{ background: 'var(--accent)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={20} color="var(--text-main)" />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, color: 'var(--text-main)' }}>
                        {isEditing ? 'Editar Modelo' : 'Nuevo Modelo'}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {isEditing ? `ID: ${machineId}` : 'Introduzca los datos del nuevo modelo.'}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', width: '100%' }}>

                    {/* Left Column: Form */}
                    <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
                        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-md)', height: 'fit-content' }}>
                            <div style={{ display: 'grid', gap: '1.5rem' }}>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ID Modelo</label>
                                    <input
                                        name="id"
                                        value={formData.id}
                                        onChange={handleChange}
                                        disabled={isEditing}
                                        required
                                        placeholder="Ej: APP001"
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border)',
                                            background: isEditing ? 'var(--bg-offset)' : 'var(--bg-main)',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tipo</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-main)',
                                            color: 'var(--text-main)'
                                        }}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Lavadora">Lavadora</option>
                                        <option value="Frigorífico">Frigorífico</option>
                                        <option value="Secadora">Secadora</option>
                                        <option value="Horno">Horno</option>
                                        <option value="Lavavajillas">Lavavajillas</option>
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Marca</label>
                                        <input
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            required
                                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Modelo</label>
                                        <input
                                            name="model"
                                            value={formData.model}
                                            onChange={handleChange}
                                            required
                                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Número de Serie</label>
                                    <input
                                        name="serial"
                                        value={formData.serial}
                                        onChange={handleChange}
                                        required
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ubicación</label>
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-primary"
                                        style={{ flex: 1, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Save size={18} />
                                        {saving ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Documentation */}
                    <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
                        {isEditing ? (
                            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-md)', height: '100%' }}>
                                    <h3 style={{ marginTop: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={20} />
                                        Documentación
                                    </h3>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label
                                            className={`btn ${uploading ? 'btn-disabled' : ''}`}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                background: 'var(--bg-offset)',
                                                color: 'var(--text-main)',
                                                border: '1px solid var(--border)',
                                                cursor: uploading ? 'not-allowed' : 'pointer',
                                                padding: '0.5rem 1rem',
                                                borderRadius: 'var(--radius-sm)'
                                            }}
                                        >
                                            <Upload size={16} />
                                            {uploading ? 'Subiendo...' : 'Adjuntar PDF'}
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handleFileUpload}
                                                style={{ display: 'none' }}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {actionStatus && (
                                            <div style={{
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius-sm)',
                                                background: actionStatus.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: actionStatus.type === 'error' ? '#ef4444' : '#10b981',
                                                border: `1px solid ${actionStatus.type === 'error' ? '#ef4444' : '#10b981'}`,
                                                fontSize: '0.9rem',
                                                marginBottom: '0.5rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span>{actionStatus.message}</span>
                                                <button onClick={() => setActionStatus(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                                            </div>
                                        )}

                                        {(!documents || documents.length === 0) && (
                                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                                No hay documentos adjuntos.
                                            </div>
                                        )}
                                        {documents && documents.map((doc, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem',
                                                background: 'var(--bg-main)',
                                                borderRadius: 'var(--radius-sm)',
                                                border: '1px solid var(--border)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                                                    <FileText size={18} color="var(--primary)" />
                                                    <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.filename}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <a
                                                        href={`${API_BASE_URL.replace('/api/sat', '')}${doc.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-ghost"
                                                        style={{ padding: '0.25rem' }}
                                                        title="Descargar"
                                                    >
                                                        <Download size={16} color="var(--text-muted)" />
                                                    </a>
                                                    {satConfig.docsSiloId && globalAppId && (
                                                        <button
                                                            onClick={async () => {
                                                                setActionStatus({ type: 'loading', message: 'Indexando...' });
                                                                try {
                                                                    console.log(`Indexing doc ${doc.filename} to silo ${satConfig.docsSiloId} app ${globalAppId}`);
                                                                    await satService.indexMachineDocument(machineId, doc.filename, globalAppId, satConfig.docsSiloId);
                                                                    setActionStatus({ type: 'success', message: 'Documento indexado correctamente' });
                                                                } catch (e) {
                                                                    console.error(e);
                                                                    setActionStatus({ type: 'error', message: 'Error al indexar en Mattin' });
                                                                }
                                                            }}
                                                            className="btn-ghost"
                                                            style={{ padding: '0.25rem' }}
                                                            title="Indexar en Mattin"
                                                        >
                                                            <Upload size={16} color="var(--primary)" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={async () => {
                                                            setActionStatus({ type: 'loading', message: 'Eliminando...' });
                                                            try {
                                                                console.log(`Deleting doc ${doc.filename} from silo ${satConfig.docsSiloId} app ${globalAppId}`);
                                                                await satService.deleteMachineDocument(machineId, doc.filename, globalAppId, satConfig.docsSiloId);
                                                                await loadDocuments();
                                                                setActionStatus({ type: 'success', message: 'Documento eliminado' });
                                                            } catch (e) {
                                                                console.error(e);
                                                                setActionStatus({ type: 'error', message: 'Error al eliminar el documento' });
                                                            }
                                                        }}
                                                        className="btn-ghost"
                                                        style={{ padding: '0.25rem' }}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} color="var(--destructive)" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                background: 'var(--bg-card)',
                                padding: '2rem',
                                borderRadius: 'var(--radius-md)',
                                height: 'fit-content',
                                border: '1px dashed var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                color: 'var(--text-muted)'
                            }}>
                                <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>Guarde el modelo primero para poder adjuntar documentación.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MachineDetail;
