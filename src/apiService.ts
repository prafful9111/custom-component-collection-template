// API Service for EHCC Feedback Form
import type {
    FeedbackListItem,
    FeedbackDetail,
    ApiResponse,
    FeedbackListResponse,
    FormType
} from './types'

const BASE_URL = 'https://stage-backend.finderr.co.in/api/v1/hospital'

// Sample JWT Bearer Token for sample@email.com
// This is a TEST token. Replace with a real token from your authentication system.
// To get a real token, you would typically call your backend's login/auth endpoint.
// Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{payload}.{signature}
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA1ZTA1NDc5LTcwNTgtNGI2Yi04OGJkLTQ4OTk1YTY1Mzg4MiIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJuYW1lIjoiSW10aWF6IiwicmVzdGF1cmFudElkIjozLCJyZXN0YXVyYW50TmFtZSI6IlRlc3QgUmVzdGF1cmFudCIsIm91dGxldElkIjozLCJvcmdhbml6YXRpb25UeXBlIjoiUkVTVEFVUkFOVCIsInJvbGUiOiJNQU5BR0VSIiwib3V0bGV0TmFtZSI6IlRlc3QgT3V0bGV0IDEiLCJicmFuY2hDb2RlIjpudWxsLCJpYXQiOjE3Njk1MDEyODYsImV4cCI6MTc3NzI3NzI4Nn0.5jNkHXpCFOR_LEzx6Ys6ZgoERqtf3ydC5bW5jfc_f6M'

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number>
}

/**
 * Generic fetch wrapper with authentication and error handling
 */
async function apiFetch<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options

    // Build URL with query parameters
    let url = `${BASE_URL}${endpoint}`
    if (params) {
        const queryString = new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
                acc[key] = String(value)
                return acc
            }, {} as Record<string, string>)
        ).toString()
        if (queryString) {
            url += `?${queryString}`
        }
    }

    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...fetchOptions.headers,
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.status}`)
        }

        return data
    } catch (error) {
        console.error('API Error:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}

/**
 * Get all feedbacks with optional filters
 */
export async function getFeedbacks(filters?: {
    type?: FormType | 'all'
    page?: number
    limit?: number
    uhid?: string
    patient_name?: string
}): Promise<ApiResponse<FeedbackListItem[]>> {
    const params: Record<string, string | number> = {}

    if (filters) {
        if (filters.type && filters.type !== 'all') {
            params.type = filters.type
        }
        if (filters.page) params.page = filters.page
        if (filters.limit) params.limit = filters.limit
        if (filters.uhid) params.uhid = filters.uhid
        if (filters.patient_name) params.patient_name = filters.patient_name
    }

    const response = await apiFetch<FeedbackListResponse>('/feedbacks', { params })

    // Transform response to match expected format
    if (response.success && response.data) {
        return {
            success: true,
            data: response.data.feedbacks || [],
            message: response.message,
        } as ApiResponse<FeedbackListItem[]>
    }

    return {
        success: false,
        message: response.message || 'Failed to fetch feedbacks',
    } as ApiResponse<FeedbackListItem[]>
}

/**
 * Get feedback detail by ID
 */
export async function getFeedbackDetail(
    id: string,
    type: FormType
): Promise<ApiResponse<FeedbackDetail>> {
    return apiFetch<FeedbackDetail>(`/feedback/${id}`, {
        params: { type },
    })
}

/**
 * Create or update feedback
 */
export async function createOrUpdateFeedback(
    data: Partial<FeedbackDetail>,
    type: FormType
): Promise<ApiResponse<FeedbackDetail>> {
    return apiFetch<FeedbackDetail>('/feedback', {
        method: 'POST',
        params: { type },
        body: JSON.stringify(data),
    })
}
