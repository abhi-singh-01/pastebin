import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function CreatePaste({ onSuccess }) {
    const [content, setContent] = useState('')
    const [ttl, setTtl] = useState('')
    const [maxViews, setMaxViews] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!content.trim()) {
            setError('Please enter some content')
            return
        }

        setLoading(true)
        setError(null)

        const body = { content: content.trim() }
        if (ttl) body.ttl_seconds = parseInt(ttl, 10)
        if (maxViews) body.max_views = parseInt(maxViews, 10)

        try {
            const response = await fetch(`${API_BASE}/api/pastes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create paste')
            }

            onSuccess(data, { ttl, maxViews })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <h1 className="card-title">Share Content</h1>

            {error && (
                <div className="error-banner" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    color: '#ef4444',
                    fontSize: '0.875rem'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste or type your content here..."
                        rows={12}
                        required
                    />
                </div>

                <div className="options-row">
                    <div className="form-group">
                        <label htmlFor="ttl">Expiration</label>
                        <select id="ttl" value={ttl} onChange={(e) => setTtl(e.target.value)}>
                            <option value="">Never expires</option>
                            <option value="300">5 minutes</option>
                            <option value="3600">1 hour</option>
                            <option value="86400">1 day</option>
                            <option value="604800">1 week</option>
                            <option value="2592000">30 days</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="max_views">Max Views</label>
                        <select id="max_views" value={maxViews} onChange={(e) => setMaxViews(e.target.value)}>
                            <option value="">Unlimited</option>
                            <option value="1">1 view (burn after reading)</option>
                            <option value="5">5 views</option>
                            <option value="10">10 views</option>
                            <option value="50">50 views</option>
                            <option value="100">100 views</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13"></path>
                        <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>
                    {loading ? 'Sharing...' : 'Share'}
                </button>
            </form>
        </div>
    )
}
