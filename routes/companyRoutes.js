import express from 'express';
import { requireAuthStandard } from '../middleware/auth';
import { companyRegistration } from '../controllers/registration/registrationController';

const router = express.Router();

router.post('/new-company', requireAuthStandard, companyRegistration);

export {
    router
}