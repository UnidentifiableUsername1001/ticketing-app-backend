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
const jwtValidation = require('../middleware/auth');

const checkEmail = body('email').isEmail().escape();
const checkPassword = body('password')
    .isLength({min: 6, max: 20})
    .isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false});

const profileValidationRules = [checkEmail, checkPassword];

// Registration  
router.post('/register', profileValidationRules, async (req, res) => {
    
    const result = validationResult(req);
    if (!result.isEmpty()) {
        logger.error('Validation errors in request', result.array());
        return res.status(400).json({error: result.array()});
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
        res.status(201).json({authToken: authToken, firstName: theUser.firstName, email: email, message: "User registered"});
    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

// Login route 
router.post('/login', profileValidationRules, async (req, res) => {

        const result = validationResult(req);
        if (!result.isEmpty()) {
            logger.error('Validation errors in request', result.array());
                return res.status(400).json({error: result.array()});
    } try {
        const email = req.body.email;
        const theUser = await user.findOne({email: email});
        
        if (theUser) {
        const passwordResult = await bcrypt.compare(req.body.password, theUser.password);

        if (!passwordResult) {
            logger.error('Passwords do not match');
            return res.status(404).json({ error: 'Incorrect details, please try again.' });
        }

        let payload = {
            user: {
                id: theUser._id.toString(),
            },
        };

        const authToken = jwt.sign(payload, JWT_SECRET);
        logger.info('User logged in successfully');
        res.status(200).json({authToken: authToken, firstName: theUser.firstName, email: email, message: "User logged in!"});
        } else {
            logger.error('No matching email DB');
            res.status(404).json({message: 'Incorrect details, please try again.'});
        }
    } catch (e) {
        logger.error(e);
        res.status(500).json({message: 'Internal server error', details: e.message});
    };
});

router.get('/dashboard-test', jwtValidation, (req, res) => {
    const id = req.user;
    res.status(200).json({message: 'Welcome to the VIP club!', user: id});
})

module.exports = router;