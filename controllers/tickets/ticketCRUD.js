const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require('mongoose');
const ticket = require('../../models/ticket');
const user = require('../../models/user');
const overflowComments = require('../../models/commentOverflow');

const ticketCreate = async (req, res) => {
    try {
        const custAttributes = req.body.customAttributes ? req.body.customAttributes.map(({key, value}) => ({key: key, value: value})) : [];

        const newTicket = new ticket({
            title: req.body.title,
            description: req.body.description,
            ticketType: req.body.ticketType,
            status: req.body.status,
            createdBy: req.user.id,
            departmentId: req.body.departmentId,
            customAttributes: custAttributes
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
        let query = {};
        if (req.user.role !== 'Admin') {
            query.departmentId = req.user.department;
        };

        const ticketArray = await ticket.find(query)
            .populate({path: 'createdBy', select: '-jobTitle -password'})
            .populate({path: 'assignedTo', select: '-jobTitle -password'})
            .exec();

            return res.status(200).json({message: "Tickets loaded", ticketArray: ticketArray});  

    } catch (e) {
        console.error('Error processing: ', e);
        return res.status(500).send("Internal server error");
    };
};

const ticketSearch = async (req, res) => {
    try {
        let query = {};
        const { page = 1, limit = 10} = req.query;
        const reqObjKey = Object.keys(req.query);
        const reqObjValue = Object.keys(req.query).map(key => req.query[key]);
        
        const setQuery = () => {
            const whiteList = ['_id', 'status', 'departmentId', 'ticketType', 'assignedTo', 'createdBy'];
            for (let i = 0; i < reqObjValue.length; i++) {
                if (reqObjValue[i] !== undefined && reqObjValue[i] !== "" && whiteList.includes(reqObjKey[i])) {
                        query[reqObjKey[i]] = reqObjValue[i]
                }
            };
        };

        setQuery();

        if (Object.keys(query).length === 0){
            return res.status(400).json({message: "Please input search parameters"});
        }

        const searchArray = await ticket.find(query).limit(limit * 1).skip((page -1 ) * limit).sort({createdAt: -1});
        const count = await ticket.countDocuments(query);

        return res.status(200).json({message: "Search complete", results: searchArray, totalPages: Math.ceil(count / limit), currentPage: page,});

    } catch (e) {
        console.error('Error processing: ', e);
        return res.status(500).send("Internal server error");
    }
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
        const ticketToUpdate = await ticket.findById(id);

        if (!ticketToUpdate) return res.status(404).json({message: 'Ticket not found'});
        if (req.user.department !== ticketToUpdate.departmentId && req.user.role !== 'Admin') {
            return res.status(403).json({message: "You don't have permission to edit this ticket"})
        }
        
        const { status, assignedUser } = req.body;

        if (status) ticketToUpdate.status = status;
        if (assignedUser) ticketToUpdate.assignedTo = assignedUser;

        await ticketToUpdate.save();

        return res.status(200).json({ticket: ticketToUpdate, message: `Ticket #${ticketToUpdate._id} updated!`});     
 
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