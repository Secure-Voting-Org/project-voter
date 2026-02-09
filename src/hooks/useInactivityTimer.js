import { useEffect, useRef, useCallback } from 'react';

const useInactivityTimer = (timeoutMs = 120000, onTimeout) => {
    const timerRef = useRef(null);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(onTimeout, timeoutMs);
    }, [timeoutMs, onTimeout]);

    useEffect(() => {
        const events = ['mousemove', 'mousedown', 'keypress', 'touchmove', 'scroll', 'click'];

        const handleActivity = () => {
            resetTimer();
        };

        // Initialize timer
        resetTimer();

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    return resetTimer; // Return reset function in case we need to manually reset it
};

export default useInactivityTimer;
