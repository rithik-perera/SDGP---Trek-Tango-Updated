const express = require('express');
const router = express.Router();
const {registerUser, loginUser, sendVerificationCode, forgotPassword, getIdByUsernameOrEmail, addPoints, getPoints} = require('../controllers/userController');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/sendVerificationCode').put(sendVerificationCode);
router.route('/forgotPassword').put(forgotPassword);
router.route('/getId/:usernameOrEmail').get(getIdByUsernameOrEmail);
router.route('/addPoints').put(addPoints);
router.route('/getPoints/:username').get(getPoints);

module.exports = router;