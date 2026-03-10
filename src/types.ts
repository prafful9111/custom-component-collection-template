// Type definitions for EHCC Feedback Form

export type FormType = 'in_patient' | 'post_discharge'
export type RatingValue = 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'FAIR' | 'POOR' | ''

// API Response Types
export interface FeedbackListItem {
    id: string
    patient_name: string
    type: FormType
    visit_date: string
    uhid: string
    created_at?: string
    updated_at?: string
}

export interface InPatientFeedback {
    id?: string
    filled_by: 'PATIENT' | 'ATTENDANT'
    patient_name?: string
    uhid?: string
    visit_date?: string
    treating_doctor?: string
    contact_number?: string
    email?: string
    overall_service_quality?: RatingValue
    admission_time_efficiency?: RatingValue
    financial_counselling?: RatingValue
    front_office_behaviour?: RatingValue
    doctor_visit_first24_hours?: RatingValue
    consent_risk_explanation?: RatingValue
    home_medication_info?: RatingValue
    hand_hygiene_compliance?: RatingValue
    id_band_verification?: RatingValue
    call_bell_response?: RatingValue
    fall_prevention_education?: RatingValue
    pain_management?: RatingValue
    dietician_counselling?: RatingValue
    food_temperature_and_timing?: RatingValue
    room_cleanliness?: RatingValue
    staff_hand_hygiene?: RatingValue
    response_to_needs?: RatingValue
    discharge_medication_info?: RatingValue
    discharge_process_time?: RatingValue
    relief_from_ailments?: RatingValue
    discharge_info_one_day_prior?: RatingValue
    privacy_and_safety_compliance?: RatingValue
    security_staff_courtesy?: RatingValue
    recommendation_score?: number
    comments?: string
    impressed_staff_name?: string
}

export interface PostDischargeFeedback {
    id?: string
    filled_by: 'PATIENT' | 'ATTENDANT'
    patient_name?: string
    uhid?: string
    visit_date?: string
    treating_doctor?: string
    contact_number?: string
    email?: string
    overall_hospital_quality?: RatingValue
    front_office_politeness?: RatingValue
    billing_waiting_time?: RatingValue
    front_office_query_response?: RatingValue
    consultation_waiting_time?: RatingValue
    time_spent_with_doctor?: RatingValue
    treatment_information_clarity?: RatingValue
    vital_monitoring?: RatingValue
    pain_screening_management?: RatingValue
    fall_education_information?: RatingValue
    sample_collection_skills?: RatingValue
    report_timeliness?: RatingValue
    radiology_consent_process?: RatingValue
    medicine_availability?: RatingValue
    medicine_education?: RatingValue
    pharmacy_waiting_time?: RatingValue
    food_quality?: RatingValue
    cleanliness_and_hygiene?: RatingValue
    parking_facilities?: RatingValue
    security_staff_courtesy?: RatingValue
    recommendation_score?: number
    comments?: string
    impressed_staff_name?: string
}

export type FeedbackDetail = InPatientFeedback | PostDischargeFeedback

export interface ApiResponse<T> {
    success: boolean
    message?: string
    data?: T
    details?: any
}

export interface FeedbackListResponse {
    feedbacks: FeedbackListItem[]
    total?: number
    page?: number
    limit?: number
}
