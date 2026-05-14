const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotenv = require('dotenv'); dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const jwtValidation = require('../middleware/auth');
const userCrudCtrl = require('../controllers/users/userCRUD');
const rbac = require('../middleware/rbac');

router.get('/', jwtValidation, userCrudCtrl.userGetAll);

router.post('/new-user', jwtValidation, rbac(['Admin']));

router.put('/update-user/:userId', jwtValidation, rbac(['Admin', 'Manager']));

module.exports = router;