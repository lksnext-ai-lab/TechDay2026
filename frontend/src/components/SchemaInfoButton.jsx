import React, { useState } from 'react';
import { Info } from 'lucide-react';
import Modal from './Modal';
import UseCaseSchema, { schemaData } from './UseCaseSchema';

const SchemaInfoButton = ({ moduleId, style = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const data = schemaData[moduleId];

    if (!data) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                title="Ver esquema técnico"
                style={{
                    background: `${data.color}10`,
                    color: data.color,
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ...style
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.background = `${data.color}20`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = `${data.color}10`;
                }}
            >
                <Info size={20} />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={data.title}
                icon={data.icon}
                color={data.color}
            >
                <UseCaseSchema moduleId={moduleId} />
            </Modal>
        </>
    );
};

export default SchemaInfoButton;
