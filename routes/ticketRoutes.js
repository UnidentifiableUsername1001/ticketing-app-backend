const express = require('express');
const jwt = require('jsonwebtoken');
const {body, validationResuly} = requiree('express-validator');
const router = express.Router();
const dotenv = require('dotenv'); dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require('mongoose');
const jwtValidation = require('../middleware/auth');
const ticket = require('../models/ticket');
const user = require('../models/user');

router.post('/create', jwtValidation, async (req, res) => {
    try {
        const newTicket = new ticket({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            createdBy: req.user.id,
            assignedTo: req.body.assignedUser,
        });

        await newTicket.save();
        return res.status(200).json({message: `Ticket #${newTicket._id} created!`})
    } catch (e) {
        console.log(e);
        return res.status(500).json("Internal server error");
    };
});

router.get('/', jwtValidation, async (req, res) => {
    try {
        const ticketArray = await ticket.find()
            .populate({path: 'createdBy', select: '-jobTitle -password'})
            .populate({path: 'assignedTo', select: '-jobTitle -password'})
            .exec();
        if (ticketArray.length == 0) return res.status(400).json({message: "No tickets available!"});
            return res.status(200).json({message: "Tickets loaded", ticketArray: ticketArray});  
    } catch (e) {
        console.log(e);
        return res.status(500).send("Internal server error");
    };
});