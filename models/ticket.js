const mongoose = require('mongoose');
const { Schema, SchemaTypes, model } = mongoose;

const validStatus = ["Open", "In progress", "Closed"];

const ticketSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: validStatus
    },
    createdBy: {
        type: SchemaTypes.ObjectId,
        ref: 'user',
        required: true,
    },
    assignedTo: {
        type: SchemaTypes.ObjectId,
        ref: 'user',
        required: true,
    }
}, {
    timestamps: true
});

const ticket = mongoose.model('Ticket', ticketSchema);
module.exports = ticket;