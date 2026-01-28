// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
    try {
        require('dotenv').config();
    } catch (e) {
        // dotenv is optional
    }
}

const express = require('express');
const cors = require('cors');
const healthRouter = require('./routes/health');
const pastesRouter = require('./routes/pastes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({
        name: 'Pastebin Lite',
        version: '1.0.0',
        endpoints: {
            health: '/api/healthz',
            createPaste: 'POST /api/pastes',
            getPaste: 'GET /api/pastes/:id',
            viewPaste: 'GET /p/:id',
        },
    });
});

app.use('/api/healthz', healthRouter);
app.use('/api/pastes', pastesRouter);

// HTML view route - maps /p/:id to the pastes router's view handler
app.get('/p/:id', (req, res, next) => {
    req.url = `/view/${req.params.id}`;
    pastesRouter(req, res, next);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
    });
});

// Start server if run directly
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Pastebin Lite server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/healthz`);
        if (process.env.TEST_MODE === '1') {
            console.log('TEST_MODE enabled - deterministic time via x-test-now-ms header');
        }
    });
}

// Export for testing
module.exports = app;
