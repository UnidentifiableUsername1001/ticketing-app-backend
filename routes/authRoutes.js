import express from 'express';
import { body } from 'express-validator';
import { loginController, passwordReset } from '../controllers/auth/authController.js';
import { reqAuthPassReset } from '../middleware/auth.js';

const router = express.Router();

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
router.post('/login', profileValidationRules, loginController);

router.put('/password-reset', passwordResetValidationRiles, reqAuthPassReset, passwordReset);

export {
    router
};