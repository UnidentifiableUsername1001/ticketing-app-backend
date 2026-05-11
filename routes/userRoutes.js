const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotenv = require('dotenv'); dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const jwtValidation = require('../middleware/auth');
const userCrudCtrl = require('../controllers/users/userCRUD');

router.get('/', jwtValidation, userCrudCtrl.userGetAll);

module.exports = router;