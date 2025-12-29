import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { getMachines, createIncident } from '../data/mockData';

const CreateIncident = ({ onBack, onCreated }) => {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // New state for type selection
    const [selectedType, setSelectedType] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        machineId: '',
        title: '',
        description: '',
        priority: 'medium',
        reportedBy: ''
    });

    useEffect(() => {
        getMachines().then(data => {
            setMachines(data);
            setLoading(false);
        });
    }, []);

    // Derived state for dropdowns
    const uniqueTypes = [...new Set(machines.map(m => m.type))];

    const availableModels = selectedType
        ? machines.filter(m => m.type === selectedType)
        : [];

    useEffect(() => {
        // Reset machineId when type changes if the current selection is no longer valid
        if (selectedType && formData.machineId) {
            const isValid = availableModels.find(m => m.id === formData.machineId);
            if (!isValid) {
                setFormData(prev => ({ ...prev, machineId: '' }));
            }
        }
    }, [selectedType, availableModels, formData.machineId]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createIncident(formData);
            onCreated();
        } catch (error) {
            console.error('Error creating incident:', error);
            alert('Error al crear la incidencia');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ color: 'var(--text-main)', padding: '2rem', textAlign: 'center' }}>Cargando datos...</div>;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onBack}
                    className="btn"
                    style={{ background: 'var(--accent)', padding: '0.5rem', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} color="var(--text-main)" />
                </button>
                <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Nueva Incidencia</h2>
            </div>

            <form onSubmit={handleSubmit} style={{
                background: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Tipo de Electrodoméstico</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-input)',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="">Seleccione tipo...</option>
                            {uniqueTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Modelo / Marca</label>
                        <select
                            name="machineId"
                            value={formData.machineId}
                            onChange={handleChange}
                            required
                            disabled={!selectedType}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-input)',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                opacity: !selectedType ? 0.6 : 1,
                                cursor: !selectedType ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <option value="">Seleccione modelo...</option>
                            {availableModels.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.brand} - {m.model} ({m.location})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Prioridad</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-input)',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="low">Baja</option>
                            <option value="medium">Media</option>
                            <option value="high">Alta</option>
                            <option value="critical">Crítica</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Reportado Por</label>
                        <input
                            type="text"
                            name="reportedBy"
                            value={formData.reportedBy}
                            onChange={handleChange}
                            placeholder="Su nombre"
                            required
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-input)',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Título de la Incidencia</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Resumen breve del problema"
                        required
                        style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Descripción Detallada</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Describa el problema, síntomas, y si ha intentado alguna solución..."
                        required
                        style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {submitting ? 'Guardando...' : <><Save size={20} /> Crear Incidencia</>}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CreateIncident;
