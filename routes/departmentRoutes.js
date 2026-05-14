const express = require('express');
const router = express.Router();
const jwtValidation = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const deptController = require('../controllers/departments/departmentController');

router.post('/new-department', jwtValidation, rbac(['Admin']), deptController.createDepartment);

router.post('/new-ticket-type', jwtValidation, rbac(['Admin', 'Manager']), deptController.newTicketType);

router.delete('/:deptId/ticket-types/:typeId', jwtValidation, rbac(['Admin', 'Manager']), deptController.deleteTicketType);

module.exports = router;