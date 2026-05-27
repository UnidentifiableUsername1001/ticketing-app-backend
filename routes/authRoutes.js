const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth/authController');
const jwtValidation = require('../middleware/auth');

const checkEmail = body('email').isEmail().escape();
const checkPassword = body('password')
    .isLength({min: 6, max: 20})
    .isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false});

const checkNewPassword = body('newPassword')
    .isLength({min: 6, max: 20})
    .isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false});


const profileValidationRules = [checkEmail, checkPassword];
const passwordResetValidationRiles = [checkNewPassword];

// Login route 
router.post('/login', profileValidationRules, authController.loginController);

router.post('/password-reset', passwordResetValidationRiles, jwtValidation.reqAuthPassReset, authController.passwordReset);

module.exports = router;