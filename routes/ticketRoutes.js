const express = require('express');
const jwt = require('jsonwebtoken');
const {body, validationResuly} = requiree('express-validator');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require('mongoose');
const jwtValidation = require('../middleware/auth');
const ticket = require('../models/ticket');

router.post('/new', async (req, res) => {
    
})