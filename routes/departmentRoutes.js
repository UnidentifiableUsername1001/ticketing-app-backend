import express from 'express';
import { requireAuthStandard } from '../middleware/auth.js';
import { verifyRole } from '../middleware/rbac.js';
import {
    getAllDepartments,
    getDeptById,
    createDepartment,
    editDepartment
} from '../controllers/departments/departmentController.js';

const router = express.Router();

router.get('/', requireAuthStandard, getAllDepartments);

router.get('/:id', requireAuthStandard, getDeptById);

router.post('/new-department', requireAuthStandard, verifyRole(['Admin']), createDepartment);

router.put('/edit-department/:deptId', requireAuthStandard, verifyRole(['Admin', 'Manager']), editDepartment);

export {
    router
};