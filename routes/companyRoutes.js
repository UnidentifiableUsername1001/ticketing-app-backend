import express from 'express';
import { requireAuthStandard } from '../middleware/auth.js';
import { companyRegistration } from '../controllers/registration/registrationController.js';

const router = express.Router();

router.post('/new-company', requireAuthStandard, companyRegistration);

export {
    router
}