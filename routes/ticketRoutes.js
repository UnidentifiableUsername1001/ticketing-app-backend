const express = require('express');
const jwt = require('jsonwebtoken');
const {body, validationResult} = requiree('express-validator');
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
        return res.status(201).json({message: `Ticket #${newTicket._id} created!`})
    } catch (e) {
        console.error('Error processing: ', e);
        return res.status(500).json("Internal server error");
    };
});

router.get('/', jwtValidation, async (req, res) => {
    try {
        const ticketArray = await ticket.find()
            .populate({path: 'createdBy', select: '-jobTitle -password'})
            .populate({path: 'assignedTo', select: '-jobTitle -password'})
            .exec();
            return res.status(200).json({message: "Tickets loaded", ticketArray: ticketArray});  
    } catch (e) {
        console.error('Error processing: ', e);
        return res.status(500).send("Internal server error");
    };
});

router.get('/:id', jwtValidation, async (req, res) => {
    try {
        const id = req.params.id;
        const foundTicket = await ticket.findById(id)
            .populate({path: 'createdBy', select: '-jobTitle -password'})
            .populate({path: 'assignedTo', select: '-jobTitle -password'})
            .exec();
        if (!foundTicket) return res.status(404).send('Ticket not found');
            return res.status(200).json(foundTicket);
    } catch (e) {
        console.error('Error fetching: ', e);
        res.status(500).send('Internal server error');
    }
});

router.put('/:id', jwtValidation, async (req, res) => {
    try {
        const id = req.params.id;
        const updatedTicket = await ticket.findByIdAndUpdate(id, { $set: req.body }, {new: true});

        if (!updatedTicket) return res.status(404).send('Ticket not found');
        return res.status(200).json({ticket: updatedTicket, message: `Ticket #${updatedTicket._id} updated!`});      
    } catch (e) {
        console.error('Error processing: ', e);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;