const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { redis } = require('../redis');
const { getCurrentTime } = require('../time');

const router = express.Router();

/**
 * Generate paste key for Redis
 */
function getPasteKey(id) {
    return `paste:${id}`;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Build the URL for a paste based on request headers
 */
function buildPasteUrl(req, id) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    return `${protocol}://${host}/p/${id}`;
}

/**
 * Check if a paste is available (not expired and not view-exhausted)
 */
function isPasteAvailable(paste, currentTime) {
    // Check TTL expiry
    if (paste.expires_at !== null && currentTime >= paste.expires_at) {
        return false;
    }

    // Check view limit
    if (paste.max_views !== null && paste.views >= paste.max_views) {
        return false;
    }

    return true;
}

/**
 * POST /api/pastes
 * Create a new paste
 */
router.post('/', async (req, res) => {
    try {
        const { content, ttl_seconds, max_views } = req.body;

        // Validate content
        if (typeof content !== 'string' || content.trim() === '') {
            return res.status(400).json({
                error: 'content is required and must be a non-empty string',
            });
        }

        // Validate ttl_seconds if provided
        if (ttl_seconds !== undefined) {
            if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
                return res.status(400).json({
                    error: 'ttl_seconds must be an integer >= 1',
                });
            }
        }

        // Validate max_views if provided
        if (max_views !== undefined) {
            if (!Number.isInteger(max_views) || max_views < 1) {
                return res.status(400).json({
                    error: 'max_views must be an integer >= 1',
                });
            }
        }

        const id = uuidv4();
        const now = getCurrentTime(req);

        const paste = {
            content: content,
            created_at: now,
            expires_at: ttl_seconds ? now + (ttl_seconds * 1000) : null,
            max_views: max_views || null,
            views: 0,
        };

        // Store in Redis
        await redis.set(getPasteKey(id), JSON.stringify(paste));

        // Set Redis TTL if ttl_seconds is provided (add buffer for cleanup)
        if (ttl_seconds) {
            await redis.expire(getPasteKey(id), ttl_seconds + 60);
        }

        return res.status(201).json({
            id: id,
            url: buildPasteUrl(req, id),
        });
    } catch (error) {
        console.error('Error creating paste:', error);
        return res.status(500).json({
            error: 'Failed to create paste',
        });
    }
});

/**
 * GET /api/pastes/:id
 * Fetch a paste via API (increments view count)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const key = getPasteKey(id);
        const currentTime = getCurrentTime(req);

        // Fetch paste from Redis
        const data = await redis.get(key);

        if (!data) {
            return res.status(404).json({
                error: 'Paste not found',
            });
        }

        const paste = JSON.parse(data);

        // Check availability before incrementing view
        if (!isPasteAvailable(paste, currentTime)) {
            return res.status(404).json({
                error: 'Paste not found',
            });
        }

        // Increment view count atomically
        paste.views += 1;
        await redis.set(key, JSON.stringify(paste));

        // Calculate remaining views
        let remaining_views = null;
        if (paste.max_views !== null) {
            remaining_views = Math.max(0, paste.max_views - paste.views);
        }

        // Format expires_at as ISO8601
        let expires_at = null;
        if (paste.expires_at !== null) {
            expires_at = new Date(paste.expires_at).toISOString();
        }

        return res.status(200).json({
            content: paste.content,
            remaining_views: remaining_views,
            expires_at: expires_at,
        });
    } catch (error) {
        console.error('Error fetching paste:', error);
        return res.status(500).json({
            error: 'Failed to fetch paste',
        });
    }
});

/**
 * GET /p/:id
 * HTML view of a paste (increments view count)
 */
router.get('/view/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const key = getPasteKey(id);
        const currentTime = getCurrentTime(req);

        // Fetch paste from Redis
        const data = await redis.get(key);

        if (!data) {
            return res.status(404).send(generateHtmlPage('Paste Not Found', '<p>This paste does not exist or has expired.</p>', true));
        }

        const paste = JSON.parse(data);

        // Check availability before incrementing view
        if (!isPasteAvailable(paste, currentTime)) {
            return res.status(404).send(generateHtmlPage('Paste Not Found', '<p>This paste does not exist or has expired.</p>', true));
        }

        // Increment view count
        paste.views += 1;
        await redis.set(key, JSON.stringify(paste));

        // Build info section
        let info = '';
        if (paste.max_views !== null) {
            const remaining = Math.max(0, paste.max_views - paste.views);
            info += `<p><strong>Remaining views:</strong> ${remaining}</p>`;
        }
        if (paste.expires_at !== null) {
            info += `<p><strong>Expires at:</strong> ${new Date(paste.expires_at).toISOString()}</p>`;
        }

        const escapedContent = escapeHtml(paste.content);
        const content = `
      ${info}
      <pre><code>${escapedContent}</code></pre>
    `;

        return res.status(200).send(generateHtmlPage('Paste', content, false));
    } catch (error) {
        console.error('Error fetching paste:', error);
        return res.status(500).send(generateHtmlPage('Error', '<p>Failed to fetch paste.</p>', true));
    }
});

/**
 * Generate HTML page
 */
function generateHtmlPage(title, body, isError) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Pastebin Lite</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
      color: #333;
    }
    h1 {
      color: ${isError ? '#dc3545' : '#333'};
    }
    pre {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    code {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
    }
    p {
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${body}
</body>
</html>`;
}

module.exports = router;
