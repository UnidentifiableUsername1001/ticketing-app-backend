import express from 'express';
import dotenv from 'dotenv'; dotenv.config();
import { requireAuthStandard } from '../middleware/auth.js';
import { userGetAll, createUser, updateUser, getUserById } from '../controllers/users/userController.js';
import { verifyRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', requireAuthStandard, userGetAll);

router.get('/:id', requireAuthStandard, getUserById);

router.post('/new-user', requireAuthStandard, verifyRole(['Admin']), createUser);

router.put('/update-user/:userId', requireAuthStandard, verifyRole(['Admin', 'Manager']), updateUser);

export {
    router
};