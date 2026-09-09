import express from 'express';
import { requireAuthStandard } from '../middleware/auth';
import { verifyRole } from '../middleware/rbac';
import {
    getAllDepartments,
    getDeptById,
    createDepartment,
    editDepartment
} from '../controllers/departments/departmentController';

const router = express.Router();

router.get('/', requireAuthStandard, getAllDepartments);

router.get('/:id', requireAuthStandard, getDeptById);

router.post('/new-department', requireAuthStandard, verifyRole(['Admin']), createDepartment);

router.put('/edit-department/:deptId', requireAuthStandard, verifyRole(['Admin', 'Manager']), editDepartment);

export {
    router
};