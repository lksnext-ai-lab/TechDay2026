import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { satService } from '../services/satService';

const ManageMachines = ({ onBack, onNavigate }) => {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadMachines();
    }, []);

    const loadMachines = () => {
        setLoading(true);
        satService.getMachines().then(data => {
            setMachines(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('¿Está seguro de eliminar este modelo?')) return;
        try {
            await satService.deleteMachine(id);
            loadMachines();
        } catch (error) {
            console.error('Error deleting machine:', error);
            alert('Error al eliminar el modelo.');
        }
    };

    const filteredMachines = machines.filter(m =>
        m.model.toLowerCase().includes(filter.toLowerCase()) ||
        m.id.toLowerCase().includes(filter.toLowerCase()) ||
        m.brand.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-main)' }}>Cargando modelos...</div>;

    return (
        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={onBack}
                    className="btn"
                    style={{ background: 'var(--accent)', padding: '0.5rem', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} color="var(--text-main)" />
                </button>
                <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Gestión de Modelos</h2>
                <div style={{ flex: 1 }}></div>

                <div style={{ position: 'relative', marginRight: '1rem' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input
                        placeholder="Buscar..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--bg-offset)', color: 'var(--text-main)' }}
                    />
                </div>

                <button
                    onClick={() => onNavigate('create')}
                    className="btn"
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Nuevo Modelo
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-offset)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Tipo</th>
                            <th style={{ padding: '1rem' }}>Marca</th>
                            <th style={{ padding: '1rem' }}>Modelo</th>
                            <th style={{ padding: '1rem' }}>Serie</th>
                            <th style={{ padding: '1rem' }}>Ubicación</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMachines.map(machine => (
                            <tr
                                key={machine.id}
                                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                onClick={() => onNavigate('edit', machine.id)}
                            >
                                <td style={{ padding: '1rem' }}>{machine.id}</td>
                                <td style={{ padding: '1rem' }}>{machine.type}</td>
                                <td style={{ padding: '1rem' }}>{machine.brand}</td>
                                <td style={{ padding: '1rem' }}>{machine.model}</td>
                                <td style={{ padding: '1rem' }}>{machine.serial}</td>
                                <td style={{ padding: '1rem' }}>{machine.location}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onNavigate('edit', machine.id); }}
                                        style={{ marginRight: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(machine.id, e)}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredMachines.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No se encontraron modelos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageMachines;
