const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { uploadCredential, getMyCredentials, deleteCredential } = require('../controllers/credentialController');

const router = express.Router();

router.use(protect);

router.post('/', uploadCredential);
router.get('/me', getMyCredentials);
router.delete('/:id', deleteCredential);

module.exports = router;
