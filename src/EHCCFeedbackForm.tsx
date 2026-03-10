import React, { useEffect, useState } from 'react'
import { type FC } from 'react'
import { Retool } from '@tryretool/custom-component-support'
import { getFeedbackDetail, createOrUpdateFeedback } from './apiService'
import {
  User,
  UserRound,
  Stethoscope,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Angry,
  Laugh,
  MessageSquare,
  Award,
  Clock,
  ShieldCheck,
  Smartphone,
  Info,
  HeartPulse,
  Syringe,
  Home,
  Utensils,
  Ambulance,
  Zap,
  Car,
  UserCheck,
  Search,
  ArrowLeft,
  Send,
  Pill
} from 'lucide-react'
import FeedbackList from './FeedbackList'
// Types
type FormType = 'in_patient' | 'post_discharge'
type RatingValue = 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'FAIR' | 'POOR' | ''

interface FormState {
  view: 'list' | 'form'
  id: string
  type: FormType
  patient_name: string
  uhid: string
  treating_doctor: string
  visit_date: string
  contact_number: string
  email: string
  filled_by: 'PATIENT' | 'ATTENDANT'
  ratings: Record<string, RatingValue>
  recommendation_score: number
  comments: string
  impressed_staff_name: string
  // Filters for list view
  filter_type: FormType | 'all'
  filter_patient_name: string
  filter_uhid: string
}

const RATING_MAP: Record<number, RatingValue> = {
  5: 'EXCELLENT',
  4: 'VERY_GOOD',
  3: 'GOOD',
  2: 'FAIR',
  1: 'POOR'
}

const REVERSE_RATING_MAP: Record<string, number> = {
  'EXCELLENT': 5,
  'VERY_GOOD': 4,
  'GOOD': 3,
  'FAIR': 2,
  'POOR': 1
}

// Sub-components moved outside to prevent remounting on parent state changes
const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="section-header">
    <div className="icon-wrapper">
      <Icon size={18} />
    </div>
    <h3>{title}</h3>
  </div>
)

const RatingSystem = ({ value, onChange }: { value: RatingValue, onChange: (val: RatingValue) => void }) => {
  const ratings = [
    { id: 'EXCELLENT' as const, label: 'Excellent', icon: Laugh, color: '#15803d', activeColor: '#dcfce7' },
    { id: 'VERY_GOOD' as const, label: 'Very Good', icon: Smile, color: '#22c55e', activeColor: '#f0fdf4' },
    { id: 'GOOD' as const, label: 'Good', icon: Meh, color: '#eab308', activeColor: '#fef9c3' },
    { id: 'FAIR' as const, label: 'Fair', icon: Frown, color: '#f97316', activeColor: '#fff7ed' },
    { id: 'POOR' as const, label: 'Poor', icon: Angry, color: '#ef4444', activeColor: '#fef2f2' },
  ]

  return (
    <div className="rating-container">
      {ratings.map((r) => {
        const Icon = r.icon
        const isActive = value === r.id
        return (
          <button
            key={r.id}
            type="button"
            className={`rating-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange(r.id)}
            style={{
              color: isActive ? r.color : '#94a3b8',
              backgroundColor: isActive ? r.activeColor : 'transparent',
              borderColor: isActive ? r.color : 'transparent'
            }}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="rating-label">{r.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const NPSScale = ({ value, onChange }: { value: number | null, onChange: (val: number) => void }) => {
  return (
    <div className="nps-container">
      <div className="nps-line"></div>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
        let colorClass = ''
        if (num <= 6) colorClass = 'nps-detractor'
        else if (num <= 8) colorClass = 'nps-passive'
        else colorClass = 'nps-promoter'

        return (
          <button
            key={num}
            type="button"
            className={`nps-btn ${colorClass} ${(value as any) === num ? 'active' : ''}`}
            onClick={() => onChange(num)}
          >
            {num}
          </button>
        )
      })}
    </div>
  )
}


const QuestionRow = ({ label, id, ratings, onRatingChange }: { label: string, id: string, ratings: Record<string, RatingValue>, onRatingChange: (id: string, val: RatingValue) => void }) => (
  <div className="question-row">
    <span className="question-label">{label}</span>
    <RatingSystem value={ratings[id] || ''} onChange={(val) => onRatingChange(id, val)} />
  </div>
)

export const EHCCFeedbackForm: FC = () => {
  const [model, setRetoolFormData] = Retool.useStateObject({
    name: 'formData',
    initialValue: {
      view: 'list',
      id: '',
      type: 'in_patient',
      patient_name: '',
      uhid: '',
      treating_doctor: '',
      visit_date: '',
      contact_number: '',
      email: '',
      filled_by: 'PATIENT',
      ratings: {},
      recommendation_score: -1,
      comments: '',
      impressed_staff_name: '',
      filter_type: 'all',
      filter_patient_name: '',
      filter_uhid: ''
    }
  })

  const formData = (model || {}) as unknown as FormState
  const [isLoadingForm, setIsLoadingForm] = useState(false)
  const [initialFormData, setInitialFormData] = useState<Partial<FormState> | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [shouldRefetchList, setShouldRefetchList] = useState(false)

  // Force list view on mount
  useEffect(() => {
    setRetoolFormData({ view: 'list' } as any)
  }, [])

  useEffect(() => {
    if (formData.view === 'form') {
      setIsLoadingForm(true)
      const timer = setTimeout(() => setIsLoadingForm(false), 800)
      return () => clearTimeout(timer)
    }
  }, [formData.view, formData.id])

  useEffect(() => {
    if (!formData.visit_date && formData.view === 'form') {
      handleInputChange('visit_date', new Date().toISOString().split('T')[0])
    }
  }, [formData.visit_date, formData.view])

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleInputChange = (field: keyof FormState, value: any) => {
    setRetoolFormData({ [field]: value } as any)
  }

  const handleRatingChange = (questionId: string, value: RatingValue) => {
    const currentRatings = (formData.ratings as Record<string, RatingValue>) || {}
    setRetoolFormData({
      ratings: { ...currentRatings, [questionId]: value }
    } as any)
  }

  const goToForm = async (id: string = '') => {
    if (id) {
      // Fetch existing feedback from API
      setIsLoadingForm(true)

      // First, determine type by checking both types
      const inPatientResponse = await getFeedbackDetail(id, 'in_patient')
      let response = inPatientResponse
      let feedbackType: FormType = 'in_patient'

      if (!inPatientResponse.success) {
        // Try post_discharge if in_patient failed
        const postDischargeResponse = await getFeedbackDetail(id, 'post_discharge')
        response = postDischargeResponse
        feedbackType = 'post_discharge'
      }

      if (response.success && response.data) {
        const data = response.data

        // Extract ratings from response
        const ratings: Record<string, RatingValue> = {}
        Object.keys(data).forEach(key => {
          if (key !== 'id' && key !== 'filled_by' && key !== 'patient_name' &&
            key !== 'uhid' && key !== 'visit_date' && key !== 'treating_doctor' &&
            key !== 'contact_number' && key !== 'email' && key !== 'recommendation_score' &&
            key !== 'comments' && key !== 'impressed_staff_name') {
            const value = (data as any)[key]
            if (value && typeof value === 'string' &&
              ['EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR'].includes(value)) {
              ratings[key] = value as RatingValue
            }
          }
        })

        const formState: Partial<FormState> = {
          view: 'form' as const,
          id: data.id || id,
          type: feedbackType,
          patient_name: data.patient_name || '',
          uhid: data.uhid || '',
          treating_doctor: data.treating_doctor || '',
          visit_date: data.visit_date || '',
          contact_number: data.contact_number || '',
          email: data.email || '',
          filled_by: data.filled_by,
          ratings: ratings,
          recommendation_score: data.recommendation_score ?? -1,
          comments: data.comments || '',
          impressed_staff_name: data.impressed_staff_name || ''
        }

        setRetoolFormData(formState as any)
        setInitialFormData(formState)
      } else {
        setToast({ message: 'Failed to load feedback: ' + (response.message || 'Unknown error'), type: 'error' })
        console.error('Error loading feedback:', response.message)
      }

      setIsLoadingForm(false)
    } else {
      // Creating new feedback
      const newFormState: Partial<FormState> = {
        view: 'form' as const,
        id: '',
        patient_name: '',
        uhid: '',
        type: 'in_patient' as const,
        ratings: {},
        comments: '',
        recommendation_score: -1,
        filled_by: 'PATIENT' as const,
        visit_date: new Date().toISOString().split('T')[0],
        treating_doctor: '',
        contact_number: '',
        email: '',
        impressed_staff_name: ''
      }

      setRetoolFormData(newFormState as any)
      setInitialFormData(newFormState)
    }
  }

  const goBack = () => {
    console.log('Navigating back to list view')
    setRetoolFormData({
      view: 'list',
      id: '',
      // Reset form fields to prevent stale data
      patient_name: '',
      uhid: '',
      treating_doctor: '',
      visit_date: '',
      contact_number: '',
      email: '',
      filled_by: null,
      ratings: null,
      comments: '',
      impressed_staff_name: ''
    } as any)
    setInitialFormData(null)
    // Signal list to refetch only if we created/updated
    if (shouldRefetchList) {
      setShouldRefetchList(false)
    }
  }

  // Check if form has changes compared to initial state
  const hasChanges = () => {
    if (!initialFormData || !formData.id) {
      // For new records, enable if filled_by is set (required field)
      return !!formData.filled_by
    }

    // Compare key fields
    const fieldsToCompare: (keyof FormState)[] = [
      'patient_name', 'uhid', 'treating_doctor', 'visit_date',
      'contact_number', 'email', 'filled_by', 'recommendation_score',
      'comments', 'impressed_staff_name', 'type'
    ]

    for (const field of fieldsToCompare) {
      if (formData[field] !== initialFormData[field]) {
        return true
      }
    }

    // Compare ratings object
    const currentRatings = formData.ratings || {}
    const initialRatings = (initialFormData.ratings as Record<string, RatingValue>) || {}

    const allRatingKeys = new Set([
      ...Object.keys(currentRatings),
      ...Object.keys(initialRatings)
    ])

    for (const key of allRatingKeys) {
      if (currentRatings[key] !== initialRatings[key]) {
        return true
      }
    }

    return false
  }

  const handleSubmit = async () => {
    // Prepare payload for API
    const payload: any = {
      filled_by: formData.filled_by,
      patient_name: formData.patient_name,
      uhid: formData.uhid,
      visit_date: formData.visit_date,
      treating_doctor: formData.treating_doctor,
      contact_number: formData.contact_number,
      email: formData.email,
      recommendation_score: formData.recommendation_score >= 0 ? formData.recommendation_score : undefined,
      comments: formData.comments,
      impressed_staff_name: formData.impressed_staff_name,
      ...formData.ratings
    }

    // Include ID only when updating existing record
    if (formData.id) {
      payload.id = formData.id
    }

    console.log('Submitting Form Data to API:', payload)

    const response = await createOrUpdateFeedback(payload, formData.type)

    if (response.success) {
      const isUpdate = !!formData.id
      setToast({
        message: `Feedback ${isUpdate ? 'updated' : 'created'} successfully!`,
        type: 'success'
      })

      setShouldRefetchList(true)

      if (isUpdate) {
        // For updates, don't refresh - just show success notification
        // The user can continue editing or navigate back
      } else {
        // For new records, go back to list to see the new record
        setTimeout(() => goBack(), 1500)
      }
    } else {
      setToast({
        message: 'Error saving feedback: ' + (response.message || 'Unknown error'),
        type: 'error'
      })
      console.error('Error saving feedback:', response.message)
    }
  }

  return (
    <div className="ehcc-form-wrapper">
      <style>{`
        :root {
          --primary: #2563eb;
          --primary-light: #eff6ff;
          --secondary: #64748b;
          --border: #e2e8f0;
          --bg-light: #f8fafc;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --white: #ffffff;
          --accent: #3b82f6;
          --gold: #f59e0b;
        }

        .ehcc-form-wrapper {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--text-main);
          width: 100%;
          height: auto;
          min-height: fit-content;
          margin: 0;
          background: var(--white);
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: visible;
          padding-bottom: 40px;
          display: flow-root;
        }

        .form-header {
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .toggle-group {
          display: flex;
          background: #e2e8f0;
          padding: 4px;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
        }

        .toggle-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          color: var(--secondary);
        }

        .toggle-btn.active {
          background: var(--white);
          color: var(--primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .patient-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          padding: 24px;
          background: var(--bg-light);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .input-group input {
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--primary);
          ring: 2px solid var(--primary-light);
        }

        .radio-group-header {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 10px;
        }

        .radio-options {
          display: flex;
          gap: 20px;
        }

        .radio-item {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .section-header {
          padding: 24px 24px 12px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--primary);
        }

        .icon-wrapper {
          background: var(--primary-light);
          color: var(--primary);
          padding: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .section-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .question-list {
          padding: 0 24px;
        }

        .question-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 12px;
          margin: 0 -12px;
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s;
          border-radius: 8px;
        }

        .question-row:hover {
          background-color: var(--bg-light);
        }

        .question-row:last-child {
          border-bottom: none;
        }

        .question-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-main);
          max-width: 60%;
        }

        .rating-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .rating-btn {
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 12px;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 70px;
        }

        .rating-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .rating-btn:hover {
          transform: translateY(-2px);
          background: #f1f5f9;
        }

        .rating-btn.active {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .nps-section {
          padding: 32px 24px;
          background: var(--primary-light);
          margin-top: 40px;
          text-align: center;
        }

        .nps-section h4 {
          margin: 0 0 20px 0;
          font-size: 16px;
          font-weight: 700;
        }

        .nps-container {
          display: flex;
          justify-content: space-between;
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }

        .nps-line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: #e2e8f0;
          z-index: 0;
          transform: translateY(-50%);
        }

        .nps-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          background: var(--white);
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          position: relative;
          z-index: 1;
        }

        .nps-btn.active {
          transform: scale(1.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          color: white;
        }

        .nps-detractor.active { background: #ef4444; border-color: #ef4444; }
        .nps-passive.active { background: #f59e0b; border-color: #f59e0b; }
        .nps-promoter.active { background: #22c55e; border-color: #22c55e; }

        .nps-btn:hover:not(.active) {
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .footer-textareas {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .textarea-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .textarea-group label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .textarea-group textarea {
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          min-height: 100px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
        }

        /* List View Styles */
        .list-container {
          padding: 24px;
        }

        .list-header {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .list-header h2 {
          margin: 0;
          color: var(--primary);
          font-weight: 800;
        }


        .search-bar {
          background: var(--bg-light);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          color: var(--secondary);
          width: 30%;
        }

        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          color: var(--text-main);
        }

        .forms-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .form-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transform: translateX(4px);
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-info h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .type-badge {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          width: fit-content;
        }

        .type-badge.in_patient { background: #dcfce7; color: #15803d; }
        .type-badge.post_discharge { background: #eff6ff; color: #1e40af; }

        .date-sub {
          font-size: 12px;
          color: var(--secondary);
        }

        .top-nav {
          padding: 12px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 100; /* Increased Z-Index */
          position: relative;
          background: var(--white); /* Ensure background is solid */
        }

        .back-btn {
          border: none;
          background: var(--bg-light);
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          color: var(--secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .back-btn:hover {
          color: var(--primary);
          background: var(--primary-light);
        }

        .form-actions {
          padding: 32px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          border-top: 1px solid var(--border);
          margin-top: 40px;
        }

        .submit-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }

        .submit-btn:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
        }

        .toast {
          position: fixed;
          bottom: 100px;
          right: 40px;
          z-index: 9999;
          min-width: 320px;
          max-width: 400px;
          padding: 16px 20px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.3s ease-out;
          font-weight: 600;
          font-size: 14px;
        }

        .toast-success {
          background: #d1fae5;
          color: #065f46;
          border: 2px solid #10b981;
        }

        .toast-error {
          background: #fee2e2;
          color: #991b1b;
          border: 2px solid #ef4444;
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toast-icon {
          font-size: 20px;
          line-height: 1;
          color: #10b981;
        }

        .toast-error .toast-icon {
          color: #ef4444;
        }

        @keyframes slideUp {
          0% {
            transform: translateY(50px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .submit-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Skeleton Animation */
        .form-skeleton {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .skeleton-row {
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite linear;
            border-radius: 12px;
            width: 100%;
        }

        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
      `}</style>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </div>
            <div>{toast.message}</div>
          </div>
        </div>
      )}

      {(formData.view || 'list') === 'list' ? (
        <FeedbackList
          onSelect={goToForm}
          onCreateNew={() => goToForm('')}
          shouldRefetch={shouldRefetchList}
          onRefetchComplete={() => setShouldRefetchList(false)}
          filters={{
            type: formData.filter_type,
            patient_name: formData.filter_patient_name,
            uhid: formData.filter_uhid
          }}
          onFilterChange={(field, value) => handleInputChange(`filter_${field}` as any, value)}
        />
      ) : (
        <>
          <div className="top-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '16px', padding: '16px 24px' }}>
            <button className="back-btn" type="button" onClick={goBack} title="Back to list" style={{ flexShrink: 0 }}>
              <ArrowLeft size={20} />
            </button>
            <h2 style={{ margin: 0, color: 'var(--primary)', fontWeight: 800 }}>
              {formData.id ? 'Feedback Details' : 'New Feedback Entry'}
            </h2>
          </div>

          <div className="form-header">
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${formData.type === 'in_patient' ? 'active' : ''}`}
                onClick={() => handleInputChange('type', 'in_patient')}
              >
                In-Patient (Admission)
              </button>
              <button
                type="button"
                className={`toggle-btn ${formData.type === 'post_discharge' ? 'active' : ''}`}
                onClick={() => handleInputChange('type', 'post_discharge')}
              >
                Out-Patient (Consultation)
              </button>
            </div>
          </div>

          <div className="patient-details-grid">
            <div className="input-group">
              <label><User size={14} /> Patient's Name</label>
              <input
                type="text"
                value={formData.patient_name}
                onChange={(e) => handleInputChange('patient_name', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="input-group">
              <label><UserCheck size={14} /> UHID</label>
              <input
                type="text"
                value={formData.uhid}
                onChange={(e) => handleInputChange('uhid', e.target.value)}
                placeholder="UHID-12345"
              />
            </div>
            <div className="input-group">
              <label><Stethoscope size={14} /> Treating Doctor</label>
              <input
                type="text"
                value={formData.treating_doctor}
                onChange={(e) => handleInputChange('treating_doctor', e.target.value)}
                placeholder="Dr. Smith"
              />
            </div>
            <div className="input-group">
              <label><Calendar size={14} /> Date of Visit</label>
              <input
                type="date"
                value={formData.visit_date}
                onChange={(e) => handleInputChange('visit_date', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label><Phone size={14} /> Contact No</label>
              <input
                type="tel"
                value={formData.contact_number}
                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                placeholder="+91-0000000000"
              />
            </div>
            <div className="input-group">
              <label><Mail size={14} /> E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div className="radio-group-header">
              <label style={{ fontSize: '14px', fontWeight: 600 }}>Feedback Filled By:</label>
              <div className="radio-options">
                <div className="radio-item" onClick={() => handleInputChange('filled_by', 'PATIENT')}>
                  <CheckCircle2 color={formData.filled_by === 'PATIENT' ? 'var(--primary)' : '#cbd5e1'} fill={formData.filled_by === 'PATIENT' ? 'var(--primary-light)' : 'none'} size={18} />
                  <span>Patient</span>
                </div>
                <div className="radio-item" onClick={() => handleInputChange('filled_by', 'ATTENDANT')}>
                  <CheckCircle2 color={formData.filled_by === 'ATTENDANT' ? 'var(--primary)' : '#cbd5e1'} fill={formData.filled_by === 'ATTENDANT' ? 'var(--primary-light)' : 'none'} size={18} />
                  <span>Attendant</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-content">
            {isLoadingForm ? (
              <div className="form-skeleton">
                <div className="skeleton-row" style={{ height: '60px', marginBottom: '24px' }}></div>
                <div className="skeleton-row" style={{ height: '200px', marginBottom: '24px' }}></div>
                <div className="skeleton-row" style={{ height: '150px', marginBottom: '24px' }}></div>
                <div className="skeleton-row" style={{ height: '100px' }}></div>
              </div>
            ) : formData.type === 'in_patient' ? (
              <>
                <SectionHeader icon={Info} title="Overall Hospital Visit" />
                <div className="question-list">
                  <QuestionRow label="Overall quality of healthcare services provided during your stay ." id="overall_service_quality" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Smartphone} title="Admission" />
                <div className="question-list">
                  <QuestionRow label="Time taken for admission completed within 30 mins." id="admission_time_efficiency" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Written Financial Counselling." id="financial_counselling" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Behavior & Communication of front office staff." id="front_office_behaviour" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Stethoscope} title="Doctor" />
                <div className="question-list">
                  <QuestionRow label="Primary doctor visited you in first 24 hours of admission." id="doctor_visit_first24_hours" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Information about risk / benefits while taking consent." id="consent_risk_explanation" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Doctor took information about home medications." id="home_medication_info" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={HeartPulse} title="Nursing" />
                <div className="question-list">
                  <QuestionRow label="Performed regular hand hygiene." id="hand_hygiene_compliance" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Identification with ID band prior eg, medicine administration, sample collection." id="id_band_verification" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Promptly responded to call bell." id="call_bell_response" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Education about fall prevention & measures." id="fall_prevention_education" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Management of pain/discomfort." id="pain_management" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Utensils} title="Food & Beverages" />
                <div className="question-list">
                  <QuestionRow label="Dietician counselling." id="dietician_counselling" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Food Delivered at desired temperature & time." id="food_temperature_and_timing" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Home} title="Cleanliness" />
                <div className="question-list">
                  <QuestionRow label="Cleanliness of room/ward." id="room_cleanliness" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Regularly hand hygiene performed by staff." id="staff_hand_hygiene" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Prompt response to needs/requirements." id="response_to_needs" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Ambulance} title="Discharge" />
                <div className="question-list">
                  <QuestionRow label="Information about discharge medication by nursing." id="discharge_medication_info" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Time taken to complete the process." id="discharge_process_time" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Relief from pre admission alignments." id="relief_from_ailments" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Information about discharge a day prior." id="discharge_info_one_day_prior" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={ShieldCheck} title="Others" />
                <div className="question-list">
                  <QuestionRow label="Compliance to patient privacy & safety." id="privacy_and_safety_compliance" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Politeness and courtesy of security Staff." id="security_staff_courtesy" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>
              </>
            ) : (
              <>
                <SectionHeader icon={Info} title="Overall Hospital Visit" />
                <div className="question-list">
                  <QuestionRow label="Overall quality of healthcare service provided by the hospital" id="overall_hospital_quality" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Smartphone} title="Front Office" />
                <div className="question-list">
                  <QuestionRow label="Politeness, Courtesy and attitude." id="front_office_politeness" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Waiting time to generate the bill." id="billing_waiting_time" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Response to your queries ." id="front_office_query_response" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Stethoscope} title="Doctor" />
                <div className="question-list">
                  <QuestionRow label="Waiting time for consultation." id="consultation_waiting_time" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Time spent in doctor consultation." id="time_spent_with_doctor" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Information about the treatment." id="treatment_information_clarity" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={HeartPulse} title="Nursing" />
                <div className="question-list">
                  <QuestionRow label="Vital Taken by nurse." id="vital_monitoring" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Pain Screening management." id="pain_screening_management" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Provided Fall education & Information ." id="fall_education_information" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Zap} title="Diagnostics" />
                <div className="question-list">
                  <QuestionRow label="Skills of sample collection staff." id="sample_collection_skills" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Information & timeliness of report delivery." id="report_timeliness" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Relevant consent taken for radiological procedure." id="radiology_consent_process" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Pill} title="Pharmacy" />
                <div className="question-list">
                  <QuestionRow label="Availability of prescribed medication." id="medicine_availability" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Education about dispensed medication." id="medicine_education" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Waiting Time to get prescribed medications." id="pharmacy_waiting_time" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Utensils} title="Cafeteria/Food" />
                <div className="question-list">
                  <QuestionRow label="Quality of Food." id="food_quality" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Cleanliness and hygiene." id="cleanliness_and_hygiene" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>

                <SectionHeader icon={Car} title="Parking & Security" />
                <div className="question-list">
                  <QuestionRow label="Car parking facilities." id="parking_facilities" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                  <QuestionRow label="Politeness and courtesy of security guard." id="security_staff_courtesy" ratings={formData.ratings} onRatingChange={handleRatingChange} />
                </div>
              </>
            )}
          </div>

          <div className="nps-section">
            <h4>How likely is it that you would recommend EHCC to a friend or family?</h4>
            <NPSScale value={formData.recommendation_score} onChange={(val) => handleInputChange('recommendation_score', val)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '600px', margin: '10px auto 0', fontSize: '11px', color: 'var(--secondary)', fontWeight: 600 }}>
              <span>Not Likely</span>
              <span>Extremely Likely</span>
            </div>
          </div>

          <div className="footer-textareas">
            <div className="textarea-group">
              <label><MessageSquare size={14} style={{ marginRight: '6px' }} /> Comments & Suggestions</label>
              <textarea
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                placeholder="Share your thoughts here..."
              />
            </div>
            <div className="textarea-group">
              <label><Award size={14} style={{ marginRight: '6px' }} /> Person whose services impressed you the most</label>
              <input
                type="text"
                value={formData.impressed_staff_name}
                onChange={(e) => handleInputChange('impressed_staff_name', e.target.value)}
                style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px' }}
                placeholder="Name of staff/doctor"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!hasChanges()}
              title={!hasChanges() ? 'No changes to submit' : 'Submit feedback'}
            >
              <Send size={18} /> Submit Feedback
            </button>
          </div>
        </>
      )}
    </div>
  )
}
