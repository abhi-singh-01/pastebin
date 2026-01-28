/**
 * Get current time for expiry calculations.
 * 
 * In TEST_MODE, reads the x-test-now-ms header for deterministic testing.
 * Falls back to Date.now() if header is missing or not in test mode.
 * 
 * @param {import('express').Request} req - Express request object
 * @returns {number} Current timestamp in milliseconds
 */
function getCurrentTime(req) {
    if (process.env.TEST_MODE === '1') {
        const testNow = req.headers['x-test-now-ms'];
        if (testNow) {
            const parsed = parseInt(testNow, 10);
            if (!isNaN(parsed) && parsed > 0) {
                return parsed;
            }
        }
    }
    return Date.now();
}

module.exports = {
    getCurrentTime,
};
