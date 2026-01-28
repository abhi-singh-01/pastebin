import { useState } from 'react'

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60)
        return `${mins} minute${mins !== 1 ? 's' : ''}`
    }
    if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600)
        return `${hours} hour${hours !== 1 ? 's' : ''}`
    }
    const days = Math.floor(seconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''}`
}

export default function PasteSuccess({ data, onNewPaste, onViewPaste }) {
    const [copied, setCopied] = useState(false)
    const { ttl, maxViews } = data.options || {}

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(data.url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback
            const input = document.getElementById('paste-url')
            input?.select()
            document.execCommand('copy')
        }
    }

    return (
        <div className="card">
            <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>

            <h2 className="success-title">Paste Created!</h2>
            <p className="success-subtitle">Share this link with others</p>

            <div className="url-box">
                <input type="text" id="paste-url" value={data.url} readOnly />
                <button
                    type="button"
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                >
                    {copied ? (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy
                        </>
                    )}
                </button>
            </div>

            <div className="paste-meta">
                <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {ttl ? `Expires in ${formatDuration(parseInt(ttl, 10))}` : 'Never expires'}
                </span>
                <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    {maxViews ? `${maxViews} view${parseInt(maxViews, 10) > 1 ? 's' : ''} max` : 'Unlimited views'}
                </span>
            </div>

            <div className="action-buttons">
                <button className="btn btn-primary" onClick={onNewPaste}>
                    Create Another
                </button>
                <button className="btn btn-secondary" onClick={onViewPaste}>
                    View Paste
                </button>
            </div>
        </div>
    )
}
