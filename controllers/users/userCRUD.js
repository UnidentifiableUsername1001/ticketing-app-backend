const express = require('express');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const router = express.Router();
const dotenv = require('dotenv'); dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require('mongoose');
const ticket = require('../../models/ticket');
const user = require('../../models/user');

const userGetAll = async (req, res) => {
        try {
        const userArray = await user.find({}).select('-password -permissionLevel').exec();
        return res.status(200).json({userArray: userArray});
    } catch (e) {
        console.log('Error: ' + e)
        res.status(500).send('Internal server error')
    }
};

module.exports = {
    userGetAll
}