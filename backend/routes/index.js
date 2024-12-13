import express from 'express';
import path from 'path';
import api from './api.js';
const router = express.Router();
router.use('/api', api);
if (process.env['NODE_ENV'] !== 'production') {
    router.get('/api/csrf/restore', (req, res) => {
        const csrfToken = req.csrfToken();
        res.cookie('XSRF-TOKEN', csrfToken);
        res.status(200).json({
            'XSRF-Token': csrfToken,
        });
    });
}
// Serve the frontend's index.html file at the root route
router.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(path.resolve('../frontend', 'dist', 'index.html'));
});
// Serve the static assets in the frontend's build folder
router.use(express.static(path.resolve('../frontend/dist')));
// Serve the frontend's index.html file at all other routes NOT starting with /api
router.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(path.resolve('../frontend', 'dist', 'index.html'));
});
export default router;
