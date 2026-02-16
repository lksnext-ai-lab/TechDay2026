import { useEffect, useRef } from 'react';
import './FloatingParticles.css';

/**
 * FloatingParticles - Animated background particles for visual appeal
 * Creates organic, floating particles that add depth to the swarm visualization
 */
const FloatingParticles = ({ activeAgentId, moderatorActive }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const updateCanvasSize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        // Initialize particles
        const particleCount = 30;
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.3 + 0.1,
            hue: Math.random() * 60 + 10, // Orange to red hues
        }));

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Boost effect when active
            const boost = activeAgentId || moderatorActive ? 1.5 : 1;

            particlesRef.current.forEach((p) => {
                // Update position
                p.x += p.vx * boost;
                p.y += p.vy * boost;

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Pulsate opacity
                p.opacity = Math.sin(Date.now() * 0.001 + p.x) * 0.15 + 0.15;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
                ctx.fill();

                // Draw connecting lines to nearby particles
                particlesRef.current.forEach((p2) => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120 && dist > 0) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        const lineOpacity = (1 - dist / 120) * 0.08;
                        ctx.strokeStyle = `hsla(${p.hue}, 80%, 60%, ${lineOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [activeAgentId, moderatorActive]);

    return <canvas ref={canvasRef} className="floating-particles" />;
};

export default FloatingParticles;
