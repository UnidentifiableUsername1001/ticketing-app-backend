const mongoose = require('mongoose');
const { Schema, SchemaTypes, model } = mongoose;
const counter = require('./counter');

const validStatus = ["Open", "In progress", "Closed"];

const ticketSchema = new Schema({
    ticketNumber: {
        type: Number,
        required: true
    },

    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true
    },

    ticketType: {
        type: String,
        required: true,
        default: 'Default'
    },

    status: {
        type: String,
        required: true,
        enum: validStatus
    },
    
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },

    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },

    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    
    customAttributes: [
        {
            key: {type: String, required: true},
            value: {}
        }
    ]
}, {
    timestamps: true
});

ticketSchema.index({departmentId: 1, status: 1, ticketType: 1, assignedTo: 1,});

ticketSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next();
    }
    try {
        const ticketCounter = await counter.findOneAndUpdate(
            {modelName: 'Ticket'},
            {$inc: {sequenceValue: 1} },
            {new: true, upsert: true}
        );
        
        this.ticketNumber = ticketCounter.sequenceValue;
        next();
    } catch (e) {
        next(e);
    }
});

const ticket = mongoose.model('Ticket', ticketSchema);
module.exports = ticket;