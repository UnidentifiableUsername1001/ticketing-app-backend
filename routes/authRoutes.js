const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth/authController');

const checkEmail = body('email').isEmail().escape();
const checkPassword = body('password')
    .isLength({min: 6, max: 20})
    .isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false});

const profileValidationRules = [checkEmail, checkPassword];

// Login route 
router.post('/login', profileValidationRules, authController.loginController);

route.post('/password-reset', profileValidationRules, authController.passwordReset);

module.exports = router;