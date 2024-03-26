const express = require('express');
const router = express.Router();
const {createSession, latestIncompleteSession, isCompleted, sessionComplete} = require('../controllers/sessionController');

router.route('/createSession').post(createSession);
router.route('/saveSession/:username').get(latestIncompleteSession);
router.route('/isCompleted').put(isCompleted);
router.route('/complete').put(sessionComplete);

module.exports = router;