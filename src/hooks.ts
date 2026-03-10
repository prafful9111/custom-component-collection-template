// Custom React hooks for common functionality

import { useState, useEffect, useRef } from 'react'

/**
 * Debounce hook - delays updating value until user stops typing
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}

/**
 * Previous value hook - returns the previous value of a variable
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>()

    useEffect(() => {
        ref.current = value
    }, [value])

    return ref.current
}
