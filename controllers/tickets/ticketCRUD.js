const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require('mongoose');
const ticket = require('../../models/ticket');
const user = require('../../models/user');
const overflowComments = require('../../models/commentOverflow');

const ticketCreate = async (req, res) => {
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
        return res.status(500).json({error: e, message: "Internal server error"});
    };
};

const ticketGetAll = async (req, res) => {
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
};

const ticketGetById = async (req, res) => {
    try {
        const id = req.params.id;
        const foundTicket = await ticket.findById(id)
            .populate({path: 'createdBy', select: '-jobTitle -password'})
            .populate({path: 'assignedTo', select: '-jobTitle -password'})
            .populate({path: 'comments.postedBy', select: 'firstName lastName'})
            .exec();
        if (!foundTicket) return res.status(404).json({message: `Ticket with ID ${id} not found`});
            return res.status(200).json(foundTicket);
    } catch (e) {
        console.log('Error fetching: ', e);
        res.status(500).send('Internal server error');
    }
};

const ticketUpdateMeta = async (req, res) => {
        try {
        const id = req.params.id;
        const { status, assignedUser } = req.body;

        const updateOperation = {};

        const setFields = {};
        if (status) setFields.status = status;
        if (assignedUser) setFields.assignedTo = assignedUser;

        if (Object.keys(setFields).length > 0) {
            updateOperation.$set = setFields;
        }

        const updatedTicket = await ticket.findByIdAndUpdate(id, updateOperation, {returnDocument: 'after'});

        if (!updatedTicket) return res.status(404).send('Ticket not found');
        return res.status(200).json({ticket: updatedTicket, message: `Ticket #${updatedTicket._id} updated!`});      
    } catch (e) {
        console.error('Error processing: ', e);
        res.status(500).send('Internal server error');
    }
};

const addTicketComment = async (req, res) => {
    try {
        const id = req.params.id;
        const ticketToUpdate = await ticket.findById(id).exec();

        if (!ticketToUpdate) return res.status(404).send('Ticket not found');

        if (ticketToUpdate.comments.length < 50) {
            ticketToUpdate.comments.push(req.body.newComment);
            await ticketToUpdate.save();
            return res.status(200).json({ticket: ticketToUpdate});
        } else {
            const oldestComment = ticketToUpdate.comments[0];
            const newOverflowComment = new overflowComments({
                text: oldestComment.text,
                postedBy: oldestComment.postedBy,
                createdAt: oldestComment.createdAt,
                relatedTicket: ticketToUpdate._id
            });

            await newOverflowComment.save();
            ticketToUpdate.comments.shift();

            ticketToUpdate.comments.push(req.body.newComment);
            await ticketToUpdate.save();
            return res.status(200).json({ticket: ticketToUpdate});
        };
    } catch (e) {
        console.log(e);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    ticketCreate,
    ticketGetAll,
    ticketGetById,
    ticketUpdateMeta,
    addTicketComment
};