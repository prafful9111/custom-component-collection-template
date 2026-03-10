import React, { useState, useEffect } from 'react'
import { Search, ChevronRight, Filter, Users, UserCheck, Plus, ChevronLeft } from 'lucide-react'
import { getFeedbacks } from './apiService'
import type { FeedbackListItem } from './types'
import { useDebounce } from './hooks'

interface FeedbackListProps {
    onSelect: (id: string) => void
    onCreateNew: () => void
    shouldRefetch: boolean
    onRefetchComplete: () => void
    filters: {
        type: 'in_patient' | 'post_discharge' | 'all'
        patient_name: string
        uhid: string
        page?: number
        limit?: number
    }
    onFilterChange: (field: string, value: string | number) => void
}

const FeedbackList: React.FC<FeedbackListProps> = ({ onSelect, onCreateNew, shouldRefetch, onRefetchComplete, filters, onFilterChange }) => {
    const [feedbacks, setFeedbacks] = useState<FeedbackListItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastFilters, setLastFilters] = useState<string>('')
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(filters?.page || 1)
    const [itemsPerPage] = useState(filters?.limit || 20)

    // Debounce search inputs to reduce API calls
    const debouncedPatientName = useDebounce(filters?.patient_name || '', 500)
    const debouncedUhid = useDebounce(filters?.uhid || '', 500)

    // Fetch feedbacks from API - only when filters change or explicitly requested
    useEffect(() => {
        const currentFilters = JSON.stringify({
            type: filters?.type || 'all',
            patient_name: debouncedPatientName,
            uhid: debouncedUhid,
            page: currentPage,
            limit: itemsPerPage
        })

        // Only fetch if filters changed or if explicitly requested via shouldRefetch
        const shouldFetch = currentFilters !== lastFilters || shouldRefetch

        if (!shouldFetch) {
            return
        }

        const fetchFeedbacks = async () => {
            setIsLoading(true)
            setError(null)

            const response = await getFeedbacks({
                type: filters?.type || 'all',
                patient_name: debouncedPatientName,
                uhid: debouncedUhid,
                page: currentPage,
                limit: itemsPerPage
            })

            if (response.success && response.data) {
                setFeedbacks(response.data)
                // Update total count if API provides it
                setTotalCount(response.data.length)
            } else {
                setError(response.message || 'Failed to fetch feedbacks')
                console.error('Error fetching feedbacks:', response.message)
            }

            setIsLoading(false)
            setLastFilters(currentFilters)

            if (shouldRefetch && onRefetchComplete) {
                onRefetchComplete()
            }
        }

        fetchFeedbacks()
    }, [filters?.type, debouncedPatientName, debouncedUhid, currentPage, itemsPerPage, shouldRefetch, lastFilters, onRefetchComplete])

    // Filtering is now done by API, but keep local reference
    const filteredForms = feedbacks

    const ListSkeleton = () => (
        <div className="skeleton-grid">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-card">
                    <div className="skeleton-line sm" style={{ width: '80px', marginBottom: '12px' }}></div>
                    <div className="skeleton-line md" style={{ width: '60%', marginBottom: '8px' }}></div>
                    <div className="skeleton-line sm" style={{ width: '40%' }}></div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="list-container">
            <div className="list-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>EHCC Physical Feedback Form - Sanganer</h2>
                <button
                    className="create-new-btn"
                    onClick={onCreateNew}
                    title="Create New Feedback Record"
                >
                    <Plus size={18} />
                    <span>Create New Record</span>
                </button>
            </div>

            <div className="filter-shelf">
                <div className="filter-row">
                    <div className="filter-group type-filter">
                        <label><Filter size={14} /> View Mode</label>
                        <div className="filter-pills">
                            <button
                                className={`pill ${filters.type === 'all' ? 'active' : ''}`}
                                onClick={() => onFilterChange('type', 'all')}
                            >All</button>
                            <button
                                className={`pill ${filters.type === 'in_patient' ? 'active' : ''}`}
                                onClick={() => onFilterChange('type', 'in_patient')}
                            >In-Patient</button>
                            <button
                                className={`pill ${filters.type === 'post_discharge' ? 'active' : ''}`}
                                onClick={() => onFilterChange('type', 'post_discharge')}
                            >Out-Patient</button>
                        </div>
                    </div>
                </div>

                <div className="filter-row search-grid">
                    <div className="search-field">
                        <label><Users size={14} /> Search Patient Name</label>
                        <div className="input-wrapper">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={filters.patient_name}
                                onChange={(e) => onFilterChange('patient_name', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="search-field">
                        <label><UserCheck size={14} /> Search UHID</label>
                        <div className="input-wrapper">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="e.g. UHID-12345"
                                value={filters.uhid}
                                onChange={(e) => onFilterChange('uhid', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="list-meta">
                Showing {filteredForms.length} records
            </div>

            <div className="forms-grid">
                {isLoading ? (
                    <ListSkeleton />
                ) : error ? (
                    <div className="empty-state error-state">
                        <Search size={48} className="empty-icon" />
                        <h3>Error Loading Feedbacks</h3>
                        <p>{error}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Please check your authentication token in apiService.ts</p>
                    </div>
                ) : filteredForms.length > 0 ? filteredForms.map(form => (
                    <div key={form.id} className="form-card" onClick={() => onSelect(form.id)}>
                        <div className="card-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span className={`type-badge ${form.type}`}>
                                    {form.type === 'in_patient' ? 'IPD' : 'OPD'}
                                </span>
                                <span className="uhid-label">{form.uhid}</span>
                            </div>
                            <h4>{form.patient_name || 'N/A'}</h4>
                            <div className="card-footer">
                                <span className="date-sub">Visit: {form.visit_date ? new Date(form.visit_date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                        <div className="action-indicator">
                            <span>Review</span>
                            <ChevronRight size={18} />
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">
                        <Search size={48} className="empty-icon" />
                        <h3>No matching feedbacks</h3>
                        <p>Adjust your filters or search terms to find what you're looking for.</p>
                        <button className="clear-btn" onClick={() => {
                            onFilterChange('type', 'all')
                            onFilterChange('patient_name', '')
                            onFilterChange('uhid', '')
                        }}>Reset Filters</button>
                    </div>
                )}
            </div>

            <style>{`
                /* Global Resets for Retool Iframe */
                body, html {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: auto !important;
                    overflow: visible !important; /* Let Retool handle the scroll if needed, or expand */
                    box-sizing: border-box;
                }

                * {
                    box-sizing: border-box;
                }

                .list-container {
                     width: 100%;
                     height: auto;
                     padding: 24px; /* Restore padding as requested */
                     overflow: hidden; /* Prevent internal scrollbars */
                }

                .list-header {
                    margin-bottom: 32px;
                }

                .filter-shelf {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .filter-row {
                    display: flex;
                    gap: 16px;
                }

                .search-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .filter-group label, .search-field label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--secondary);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }

                .filter-pills {
                    display: flex;
                    gap: 8px;
                    background: white;
                    padding: 4px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    width: fit-content;
                }

                .pill {
                    padding: 6px 16px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .pill:hover {
                    color: var(--primary);
                }

                .pill.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-wrapper svg {
                    position: absolute;
                    left: 12px;
                    color: #94a3b8;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 10px 10px 10px 40px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s;
                    background: white;
                }

                .input-wrapper input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .list-meta {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 600;
                    margin-bottom: 12px;
                    padding-left: 4px;
                }

                .uhid-label {
                    font-size: 11px;
                    color: #64748b;
                    background: #f1f5f9;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 700;
                }

                .card-footer {
                    margin-top: 4px;
                }

                .action-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #94a3b8;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    transition: all 0.2s;
                }

                .form-card:hover .action-indicator {
                    color: var(--primary);
                    transform: translateX(4px);
                }

                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px 20px;
                    background: #f8fafc;
                    border: 2px dashed #e2e8f0;
                    border-radius: 16px;
                }

                .empty-icon {
                    color: #cbd5e1;
                    margin-bottom: 16px;
                }

                .empty-state h3 {
                    color: #1e293b;
                    margin-bottom: 8px;
                }

                .empty-state p {
                    color: #64748b;
                    margin-bottom: 24px;
                }

                .clear-btn {
                    padding: 10px 24px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    color: var(--primary);
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .clear-btn:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }

                .skeleton-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .skeleton-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                }

                .skeleton-line {
                    height: 12px;
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                    border-radius: 4px;
                }

                .skeleton-line.sm { height: 8px; }
                .skeleton-line.md { height: 16px; }

                .create-new-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                }

                .create-new-btn:hover {
                    background: #1d4ed8;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
                }

                .error-state {
                    border-color: #fca5a5;
                    background: #fef2f2;
                }

                .error-state .empty-icon {
                    color: #f87171;
                }

                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    )
}

export default FeedbackList
