const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv'); dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const pino = require('pino');
const logger = pino();
const mongoose = require('mongoose');
const user = require('../../models/user');

const loginController = async (req, res) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        logger.error('Validation errors in request', result.array());
            return res.status(400).json({error: result.array()});

    } try {
        const email = req.body.email;
        const theUser = await user.findOne({email: email});

        if (!theUser) return res.status(404).json({message: "User not found"});

            const passwordResult = await bcrypt.compare(req.body.password, theUser.password);

            if (!passwordResult) {
                logger.error('Passwords do not match');
                return res.status(400).json({ error: 'Incorrect details, please try again.' });
            }

            if (theUser.passwordResetRequired) {
                let payload = {
                    user: {
                        id: theUser._id.toString(),
                        scope: 'password_reset_only'
                    }
                };
                const tempAuthToken = jwt.sign(payload, JWT_SECRET, {expiresIn: '10m'});
                return res.status(200).json({message: "Password reset required", JWT: tempAuthToken});
            }

            let payload = {
                user: {
                    id: theUser._id.toString(),
                    role: theUser.role,
                    department: theUser.departmentId,
                    scope: 'user_scope'
                },
            };

            const authToken = jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});
            logger.info('User logged in successfully');
            return res.status(200).json({authToken: authToken, firstName: theUser.firstName, email: email, message: "User logged in!"});
    } catch (e) {
        logger.error(e);
        return res.status(500).json({message: 'Internal server error', details: e.message});
    };
};

const passwordReset = async (req, res) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        logger.error('Validation errors in request', result.array());
        return res.status(400).json({error: result.array()});
    }

    try {
        const theUser = await user.findById(req.user.id);

        if (!theUser) return res.status(404).json({message: "User not found"});

        const oldPassword = await bcrypt.compare(req.body.oldPassword, theUser.password);
        if (!oldPassword) return res.status(400).json({messaged: "Incorrect existing password"});

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.newPassword, salt);

        theUser.password = hash;
        theUser.passwordResetRequired = false;
        await theUser.save();

        let payload = {
            user: {
                id: theUser._id.toString(),
                role: theUser.role,
                department: theUser.departmentId,
                scope: 'user_scope'
            }
        };

        const authToken = jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});
        return res.status(200).json({authToken: authToken, firstName: theUser.firstName, email: theUser.email, message: "User logged in!"});

    } catch (e) {
        console.log(e)
        return res.status(500).json({message: 'Internal server error', details: e.message});
    }
};

module.exports = {
    loginController,
    passwordReset,
}