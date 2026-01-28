import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function ViewPaste({ pasteId, onNewPaste }) {
    const [paste, setPaste] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPaste = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/pastes/${pasteId}`)
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Paste not found')
                }

                setPaste(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchPaste()
    }, [pasteId])

    if (loading) {
        return (
            <div className="card">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="card error-card">
                <div className="error-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h2 className="error-title">Paste Not Found</h2>
                <p className="error-message">{error}</p>
                <button className="btn btn-primary" onClick={onNewPaste}>
                    Create New Paste
                </button>
            </div>
        )
    }

    return (
        <div className="card">
            <h1 className="card-title">Paste Content</h1>

            {(paste.remaining_views !== null || paste.expires_at) && (
                <div className="paste-info">
                    {paste.remaining_views !== null && (
                        <span className="paste-info-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {paste.remaining_views} view{paste.remaining_views !== 1 ? 's' : ''} remaining
                        </span>
                    )}
                    {paste.expires_at && (
                        <span className="paste-info-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Expires: {new Date(paste.expires_at).toLocaleString()}
                        </span>
                    )}
                </div>
            )}

            <div className="paste-view">
                <pre>{paste.content}</pre>
            </div>

            <div className="action-buttons" style={{ marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={onNewPaste}>
                    Create New Paste
                </button>
            </div>
        </div>
    )
}
