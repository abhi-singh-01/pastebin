const express = require('express');
const { ping } = require('../redis');

const router = express.Router();

/**
 * GET /api/healthz
 * Health check endpoint that verifies Redis connectivity
 */
router.get('/', async (req, res) => {
    try {
        const isHealthy = await ping();

        if (isHealthy) {
            return res.status(200).json({ ok: true });
        }

        return res.status(503).json({
            ok: false,
            error: 'Redis connection failed',
        });
    } catch (error) {
        return res.status(503).json({
            ok: false,
            error: 'Health check failed',
        });
    }
});

module.exports = router;
