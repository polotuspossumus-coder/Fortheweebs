const requireTier = require('../middleware/requireTier');

router.get('/image-editor', requireTier('85'), (req, res) => { /* ... */ });
router.get('/video-editor', requireTier('85'), (req, res) => { /* ... */ });
router.get('/soundboard', requireTier('80'), (req, res) => { /* ... */ });
