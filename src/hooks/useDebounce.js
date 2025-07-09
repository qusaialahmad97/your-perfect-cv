// src/hooks/useDebounce.js

import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a value.
 * @param {any} value The value to debounce (e.g., the cvData object).
 * @param {number} delay The delay in milliseconds.
 * @returns The debounced value, which only updates after the delay.
 */
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if the value changes before the delay has passed
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Only re-run the effect if value or delay changes

    return debouncedValue;
}