import { useMemo, useEffect, useRef } from 'react';
import {
    ReactFlow,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AgentNode, ModeratorNode } from './AgentNode';

const nodeTypes = { agent: AgentNode, moderator: ModeratorNode };

/** Estimated node dimensions for collision-free placement */
const AGENT_NODE_W = 140;
const AGENT_NODE_H = 130;
const MODERATOR_NODE_W = 160;
const MODERATOR_NODE_H = 140;

/**
 * Given an angle (radians) from center→agent, return the handle id
 * on the agent that should receive the edge (the side facing the center),
 * and the handle id on the moderator that should emit the edge.
 *
 * We split the circle into 4 quadrants:
 *   top-right, bottom-right, bottom-left, top-left
 */
const getHandlePair = (angle) => {
    // Normalise angle to [0, 2π)
    const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Agent is above  → edge enters agent from bottom,  exits moderator from top
    // Agent is right  → edge enters agent from left,    exits moderator from right
    // Agent is below  → edge enters agent from top,     exits moderator from bottom
    // Agent is left   → edge enters agent from right,   exits moderator from left

    if (a >= (7 * Math.PI) / 4 || a < Math.PI / 4) {
        // Agent to the RIGHT of center
        return { sourceHandle: 'source-right', targetHandle: 'left' };
    }
    if (a >= Math.PI / 4 && a < (3 * Math.PI) / 4) {
        // Agent BELOW center
        return { sourceHandle: 'source-bottom', targetHandle: 'top' };
    }
    if (a >= (3 * Math.PI) / 4 && a < (5 * Math.PI) / 4) {
        // Agent to the LEFT of center
        return { sourceHandle: 'source-left', targetHandle: 'right' };
    }
    // Agent ABOVE center
    return { sourceHandle: 'source-top', targetHandle: 'bottom' };
};

/**
 * Build a radial graph layout.
 * Agents are evenly spaced around the moderator with a radius large enough
 * to guarantee no overlap between adjacent nodes.
 */
const buildGraph = (agents, moderatorConfigured) => {
    const nodes = [];
    const edges = [];
    const count = agents.length;

    // Minimum radius so adjacent nodes never overlap:
    // chord ≥ maxNodeDiag  →  2·R·sin(π/n) ≥ maxNodeDiag
    const maxNodeDiag = Math.hypot(AGENT_NODE_W, AGENT_NODE_H);
    const minRadius = count > 1
        ? (maxNodeDiag + 40) / (2 * Math.sin(Math.PI / count))
        : 0;
    const radius = Math.max(minRadius, 240);

    // Virtual center
    const cx = radius + AGENT_NODE_W / 2 + 60;
    const cy = radius + AGENT_NODE_H / 2 + 60;

    // Moderator at the center
    if (moderatorConfigured) {
        nodes.push({
            id: 'moderator',
            type: 'moderator',
            position: { x: cx - MODERATOR_NODE_W / 2, y: cy - MODERATOR_NODE_H / 2 },
            data: { active: false },
            draggable: false,
            selectable: false,
        });
    }

    // Start at -π/2 so the first node is at top-center
    const startAngle = -Math.PI / 2;

    agents.forEach((agent, i) => {
        const angle = startAngle + (2 * Math.PI * i) / count;
        const x = cx + radius * Math.cos(angle) - AGENT_NODE_W / 2;
        const y = cy + radius * Math.sin(angle) - AGENT_NODE_H / 2;

        nodes.push({
            id: agent.id,
            type: 'agent',
            position: { x, y },
            data: {
                label: agent.name,
                color: agent.color,
                status: 'idle',
            },
            draggable: false,
            selectable: false,
        });

        if (moderatorConfigured) {
            const { sourceHandle, targetHandle } = getHandlePair(angle);

            edges.push({
                id: `e-mod-${agent.id}`,
                source: 'moderator',
                target: agent.id,
                sourceHandle,
                targetHandle,
                type: 'smoothstep',
                animated: false,
                style: {
                    stroke: 'rgba(255,255,255,0.15)',
                    strokeWidth: 1.5,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: 'rgba(255,255,255,0.25)',
                    width: 14,
                    height: 14,
                },
            });
        }
    });

    return { nodes, edges };
};

/**
 * Inner component that uses the useReactFlow hook
 */
const FlowContent = ({
    agents,
    activeAgentId,
    doneAgentIds,
    moderatorActive,
    moderatorConfigured,
}) => {
    // Build initial layout once
    const initial = useMemo(
        () => buildGraph(agents, moderatorConfigured),
        [agents, moderatorConfigured]
    );

    const [nodes, setNodes] = useNodesState(initial.nodes);
    const [edges, setEdges] = useEdgesState(initial.edges);
    const { fitView } = useReactFlow();
    const hasInitialized = useRef(false);

    // Fit view only once on initial mount
    useEffect(() => {
        if (!hasInitialized.current && nodes.length > 0) {
            const timer = setTimeout(() => {
                fitView({ padding: 0.15, duration: 300 });
                hasInitialized.current = true;
            }, 100);
            return () => clearTimeout(timer);
        }
    }, []); // Empty deps - only run once

    // Update node states whenever activeAgentId or doneAgentIds change
    useEffect(() => {
        setNodes((nds) =>
            nds.map((n) => {
                if (n.type === 'moderator') {
                    return { ...n, data: { ...n.data, active: moderatorActive } };
                }
                if (n.type === 'agent') {
                    let status = 'idle';
                    if (n.id === activeAgentId) status = 'thinking';
                    else if (doneAgentIds.has(n.id)) status = 'done';
                    return { ...n, data: { ...n.data, status } };
                }
                return n;
            })
        );
    }, [activeAgentId, doneAgentIds, moderatorActive, setNodes]);

    // Update edges whenever activeAgentId changes
    useEffect(() => {
        setEdges((eds) =>
            eds.map((e) => {
                const isActive = e.target === activeAgentId;

                return {
                    ...e,
                    type: 'smoothstep',
                    animated: isActive,
                    style: isActive
                        ? {
                              stroke: '#F85900',
                              strokeWidth: 2.5,
                              filter: 'drop-shadow(0 0 6px rgba(248,89,0,0.6)) drop-shadow(0 0 14px rgba(248,89,0,0.3))',
                          }
                        : { stroke: 'rgba(255,255,255,0.18)', strokeWidth: 1.5 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: isActive ? '#F85900' : 'rgba(255,255,255,0.25)',
                        width: 14,
                        height: 14,
                    },
                };
            })
        );
    }, [activeAgentId, setEdges]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            proOptions={{ hideAttribution: true }}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            preventScrolling={false}
            fitView
            fitViewOptions={{ padding: 0.2 }}
        >
            <Background color="rgba(255,255,255,0.06)" gap={26} size={1.2} />
        </ReactFlow>
    );
};

/**
 * SwarmFlow — the visual React Flow graph panel.
 * Wrapped with ReactFlowProvider to enable useReactFlow hook.
 */
const SwarmFlow = (props) => {
    return (
        <ReactFlowProvider>
            <FlowContent {...props} />
        </ReactFlowProvider>
    );
};

export default SwarmFlow;
