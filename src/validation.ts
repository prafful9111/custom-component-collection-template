// Validation utilities for form inputs

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email) {
        return { valid: true } // Empty is valid (not required)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Please enter a valid email address' }
    }

    return { valid: true }
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
    if (!phone) {
        return { valid: true } // Empty is valid (not required)
    }

    // Remove spaces, hyphens, and parentheses
    const cleaned = phone.replace(/[\s\-()]/g, '')

    // Check if it's 10 digits (optionally with +91 prefix)
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/

    if (!phoneRegex.test(cleaned)) {
        return { valid: false, error: 'Please enter a valid 10-digit phone number' }
    }

    return { valid: true }
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): { valid: boolean; error?: string } {
    if (value === null || value === undefined || value === '') {
        return { valid: false, error: `${fieldName} is required` }
    }

    return { valid: true }
}
