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
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
});

const ticket = mongoose.model('Ticket', ticketSchema);
module.exports = ticket;