import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Brain, CheckCircle, Loader } from 'lucide-react';

/**
 * Shared set of handles on all four sides.
 * Each handle carries a unique id so edges can reference sourceHandle / targetHandle.
 */
const AllSideHandles = memo(() => (
    <>
        <Handle type="target" position={Position.Top}    id="top"    />
        <Handle type="target" position={Position.Right}  id="right"  />
        <Handle type="target" position={Position.Bottom} id="bottom" />
        <Handle type="target" position={Position.Left}   id="left"   />
        <Handle type="source" position={Position.Top}    id="source-top"    />
        <Handle type="source" position={Position.Right}  id="source-right"  />
        <Handle type="source" position={Position.Bottom} id="source-bottom" />
        <Handle type="source" position={Position.Left}   id="source-left"   />
    </>
));
AllSideHandles.displayName = 'AllSideHandles';

/** Status labels */
const STATUS_LABEL = { thinking: 'Pensando…', done: 'Listo', idle: 'Esperando' };

/**
 * AgentNode — custom React Flow node for a swarm agent.
 * data: { label, color, status: 'idle' | 'thinking' | 'done' }
 */
const AgentNode = memo(({ data }) => {
    const { label, color, status = 'idle' } = data;

    const stateMap = { thinking: 'agent-node--active', done: 'agent-node--done' };
    const stateClass = stateMap[status] || 'agent-node--idle';

    return (
        <div
            className={`agent-node ${stateClass}`}
            style={{ '--node-color': color }}
        >
            <AllSideHandles />

            {/* Pulse ring behind avatar when thinking */}
            {status === 'thinking' && (
                <div className="agent-node__pulse-ring" style={{ borderColor: color }} />
            )}

            <div className="agent-node__avatar" style={{ background: color }}>
                {status === 'done' && <CheckCircle size={20} />}
                {status === 'thinking' && <Loader size={20} className="agent-node__spinner" />}
                {status === 'idle' && <Bot size={20} />}
            </div>

            <span className="agent-node__name">{label}</span>

            <span className={`agent-node__status agent-node__status--${status}`}>
                {STATUS_LABEL[status]}
            </span>
        </div>
    );
});

AgentNode.displayName = 'AgentNode';

/**
 * ModeratorNode — the central orchestrator node.
 * data: { active: boolean }
 */
const ModeratorNode = memo(({ data }) => {
    const { active } = data;

    return (
        <div className={`moderator-node ${active ? 'moderator-node--active' : ''}`}>
            <AllSideHandles />

            {active && <div className="moderator-node__ring" />}

            <div className="moderator-node__icon">
                <Brain size={26} className={active ? 'moderator-node__brain--active' : ''} />
            </div>

            <span className="moderator-node__label">
                Moderador
                {active && <span className="moderator-pulse">●</span>}
            </span>
        </div>
    );
});

ModeratorNode.displayName = 'ModeratorNode';

export { AgentNode, ModeratorNode };

