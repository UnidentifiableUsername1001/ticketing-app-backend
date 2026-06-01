const express = require('express');
const router = express.Router();
const jwtValidation = require('../middleware/auth');
const { verifyRole } = require('../middleware/rbac');
const deptController = require('../controllers/departments/departmentController');

router.get('/', jwtValidation.requireAuthStandard, deptController.getAllDepartments);

router.get('/:id', jwtValidation.requireAuthStandard, deptController.getDeptById);

router.post('/new-department', jwtValidation.requireAuthStandard, verifyRole(['Admin']), deptController.createDepartment);

router.post('/new-ticket-type', jwtValidation.requireAuthStandard, verifyRole(['Admin', 'Manager']), deptController.newTicketType);

router.delete('/:deptId/ticket-types/:typeId', jwtValidation.requireAuthStandard, verifyRole(['Admin', 'Manager']), deptController.deleteTicketType);

module.exports = router;