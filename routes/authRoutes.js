const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const pino = require('pino');
const logger = pino();
const mongoose = require('mongoose');
const user = require('../models/user');

// Registration  
router.post('/register', body('email').isEmail().escape(), async (req, res) => {
    
    const result = validationResult(req);
    if (!result.isEmpty()) {
        logger.error('Validation errors in request', result.array());
        return res.status(412).json({error: result.array()});
    } try {
        const email = req.body.email;
        const existingEmail = await user.findOne({email: email});

        if (existingEmail) {
            logger.error(`${email} exists in system, please try logging in`);
            res.status(400).json({message: "Email exists in system"});
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        const newUser = new user({
            jobTitle: req.body.jobTitle,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: email,
            password: hash,
            permissionLevel: "stdUser"
        });
        
        await newUser.save();

        const payload = {
            user: {
                id: newUser._id
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.status(201).json({authtoken, email});
    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});

