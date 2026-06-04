const express = require('express');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const router = express.Router();
const dotenv = require('dotenv'); dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require('mongoose');
const ticket = require('../../models/ticket');
const user = require('../../models/user');
const department = require('../../models/department');

const userGetAll = async (req, res) => {
        try {
        const userArray = await user.find({}).select('-password').exec();
        return res.status(200).json({userArray: userArray});
    } catch (e) {
        console.log('Error: ' + e);
        res.status(500).send('Internal server error');
    }
};

const getUserById = async (req, res) => {
    try {
        const targetUser = await user.findById(req.params.id).select('-password').exec();

        if(!targetUser) return res.status(404).json({message: `User with ID: ${req.params.id}  not found`});

        return res.status(200).json({message: "User found!", user: targetUser});
    } catch (e) {
        console.log(e);
        res.status(500).send('Internal server error');
    }
}

const createUser = async (req, res) => {
    try {

        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.log('Validation errors in request', result.array());
            return res.status(400).json({error: result.array()});
        }

        const {jobTitle, firstName, lastName, email, password, departmentId, role} = req.body;
        const checkIfExisting = await user.findOne({email: email});
        const checkDept = await department.findOne({_id: departmentId});

        if (checkIfExisting) {
            return res.status(409).json({message: "Duplicate entry."});
        };

        if (!checkDept) {
            return res.status(404).json({message: "Department not found"});
        };

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = new user({
            jobTitle: jobTitle,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hash,
            departmentId: departmentId, 
            role: role
        });

        await newUser.save();
        return res.status(201).json({message: "New user successfully created."});
    } catch (e) {
        console.log(e);
        return res.status(500).send("Internal server error");
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userToUpdate = await user.findOne({_id: userId});

        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.user.role !== 'Admin' && req.user.department !== userToUpdate.departmentId) {
            return res.status(403).json({message: "Not authorised to update users outside your department"});
        }

        const { firstName, lastName, jobTitle, departmentId, role, passwordResetRequired, email } = req.body;
        const setFields = {};

        if (firstName !== undefined && firstName !== '') setFields.firstName = firstName.trim();
        if (lastName !== undefined && lastName !== '') setFields.lastName = lastName.trim();
        if (jobTitle !== undefined && jobTitle !== '') setFields.jobTitle = jobTitle.trim();
        if (departmentId !== undefined && departmentId !== '') setFields.departmentId = departmentId;
        if (role !== undefined && role !== '') setFields.role = role;
        if (passwordResetRequired !== undefined) setFields.passwordResetRequired = passwordResetRequired;
        if (email !== undefined && email !== '') setFields.email = email;

        if (Object.keys(setFields).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        userToUpdate.$set(setFields);
        await userToUpdate.save()

        return res.status(200).json({ 
            message: "User updated successfully", 
            user: userToUpdate 
        });

    } catch (e) {
        console.error("Update error:", e);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    userGetAll,
    createUser,
    updateUser,
    getUserById
}