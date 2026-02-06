import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, icon: Icon, color, children, maxWidth = '700px' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content"
                style={{ maxWidth }}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-header" style={{ borderColor: color }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {Icon && (
                            <div style={{
                                color: color,
                                background: `${color}15`,
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex'
                            }}>
                                <Icon size={24} />
                            </div>
                        )}
                        <h2 style={{ color: color }}>{title}</h2>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
