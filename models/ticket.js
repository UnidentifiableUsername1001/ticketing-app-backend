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

    ticketType: {
        type: String,
        required: true,
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

    comments: [
        {
            text: {type: String, required: true},
            postedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            createdAt: {type: Date, default: Date.now}
        }
    ],

    customAttributes: [
        {
            key: {type: String, required: true},
            value: {type: String, required: true}
        }
    ]
}, {
    timestamps: true
});

ticketSchema.index({departmentId: 1, status: 1, ticketType: 1, assignedTo: 1,});

const ticket = mongoose.model('Ticket', ticketSchema);
module.exports = ticket;