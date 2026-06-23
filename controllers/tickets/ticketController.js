const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require('mongoose');
const ticket = require('../../models/ticket');
const user = require('../../models/user');
const ticketServices = require('../../services/ticket-services/ticketServices');
const comments = require('../../models/comments');

const ticketCreate = async (req, res) => {
    try {
        const custAttributes = req.body.customAttributes ? req.body.customAttributes.map(({key, value}) => ({key: key, value: value})) : [];
        const ticketAssignment = ticketServices(req.body.departmentId);

        const newTicket = new ticket({
            title: req.body.title,
            description: req.body.description,
            ticketType: req.body.ticketType,
            status: req.body.status,
            createdBy: req.user.id,
            departmentId: req.body.departmentId,
            assignedTo: ticketAssignment,
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
            .populate({path: 'departmentId', select: 'name'})
            .exec();

            return res.status(200).json({message: "Tickets loaded", ticketArray: ticketArray});  

    } catch (e) {
        console.error('Error processing: ', e);
        return res.status(500).send("Internal server error");
    };
};

const getRequestedByUser = async (req, res) => {
    try {
        const query = req.user.id;
        
        const ticketArray = await ticket.find({createdBy: query})
            .populate({path: 'createdBy', select: '-jobTitle -password'})
            .populate({path: 'assignedTo', select: '-jobTitle -password'})
            .populate({path: 'departmentId', select: 'name'})
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
        
        const { status, assignedUser, follower } = req.body;

        if (status) ticketToUpdate.status = status;
        if (assignedUser) ticketToUpdate.assignedTo = assignedUser;

        await ticketToUpdate.save();

        return res.status(200).json({ticket: ticketToUpdate, message: `Ticket #${ticketToUpdate._id} updated!`});     
 
    } catch (e) {
        console.error('Error processing: ', e);
        res.status(500).send('Internal server error');
    }
};

const followTicket = async (req, res) => {
    try {
        const id = req.params.id;
        const ticketToUpdate = await ticket.findById(id);

        if (!ticketToUpdate) return res.status(404).json({message: 'Ticket not found'});

        const { follower } = req.body;

        ticketToUpdate.followers = follower;

        await ticketToUpdate.save();

        return res.status(200).json({ticket: ticketToUpdate, message: `Ticket #${ticketToUpdate._id} updated!`});
    } catch (e) {
        console.error(e)
        res.status(500).send('Internal server error');
    }
};

const addTicketComment = async (req, res) => {
    try {
        const id = req.params.id;

        const targetTicket = await ticket.findById(id);
        if (!targetTicket)
            return res.status(404).json({message: "Ticket not found"});

        // I'll assume uploadedFiles and mentions are arrays
        let { bodyText, uploadedFiles, mentions } = req.body;
        const postedBy = req.user.id;

        if (Array.isArray(uploadedFiles) && uploadedFiles.length !==0) {
            const sanitisedFiles = uploadedFiles.map(file => ({
                fileName: file.fileName,
                fileUrl: file.fileUrl,
                fileType: file.fileType
            }));

            uploadedFiles = sanitisedFiles;
        } else {
            uploadedFiles = [];
        };

        if (Array.isArray(mentions) && mentions.length !==0) {
            const sanitisedMentions = mentions.map(mention => (
                mention._id
            ));

            mentions = sanitisedMentions;

        } else {
            mentions = [];
        };

        const count = await user.countDocuments({_id: { $in: mentions } });

        if(mentions.length !== count && mentions.length !== 0) 
            return res.status(400).json({message: "1 or more mentioned users don't exist in the database"});

        const commentPayload = {
            ticketId: id,
            postedBy: postedBy,
            bodyText: bodyText,
            mentions: mentions,
            attachments: uploadedFiles
        };

        const newComment = new comments(commentPayload);
        await newComment.save();

        return res.status(201).json({message: "Comment added"});

    } catch (e) {
        console.log(e);
        return res.status(500).send('Internal server error');
    }
};

const getComments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const ticketId = req.params.id;

        const commentArray = await comments.find({ticketId: ticketId})
            .limit(limit * 1)
            .skip((page -1 ) * limit)
            .sort({createdAt: -1})
            .populate({path: 'postedBy', select: 'firstName lastName'});

        const count = await comments.countDocuments({ticketId: ticketId});

        return res.status(200).json({message: "Search complete", results: commentArray, totalPages: Math.ceil(count / limit), currentPage: page,});

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
    addTicketComment,
    getComments,
    followTicket
};