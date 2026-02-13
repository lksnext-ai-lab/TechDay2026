import { useState, useEffect, useRef } from 'react';

/**
 * StreamingText — renders text character-by-character with a blinking cursor.
 * Perfect for a "typewriter" / streaming effect.
 *
 * Props:
 *  - text: string to stream
 *  - speed: ms per character (default 18)
 *  - onComplete: callback when streaming finishes
 */
const StreamingText = ({ text, speed = 18, onComplete }) => {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const indexRef = useRef(0);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(0);

    useEffect(() => {
        // Reset when text changes
        setDisplayed('');
        setDone(false);
        indexRef.current = 0;
        lastTimeRef.current = 0;

        const step = (timestamp) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const elapsed = timestamp - lastTimeRef.current;

            if (elapsed >= speed) {
                // Calculate how many chars to advance
                const chars = Math.max(1, Math.floor(elapsed / speed));
                const nextIndex = Math.min(indexRef.current + chars, text.length);

                setDisplayed(text.slice(0, nextIndex));
                indexRef.current = nextIndex;
                lastTimeRef.current = timestamp;

                if (nextIndex >= text.length) {
                    setDone(true);
                    onComplete?.();
                    return;
                }
            }

            rafRef.current = requestAnimationFrame(step);
        };

        rafRef.current = requestAnimationFrame(step);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [text, speed, onComplete]);

    return (
        <span>
            {displayed}
            {!done && <span className="streaming-cursor" />}
        </span>
    );
};

export default StreamingText;
