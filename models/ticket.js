const mongoose = require('mongoose');
const { Schema, SchemaTypes, model } = mongoose;
const counter = require('./counter');

const validStatus = ["Open", "In progress", "Closed"];

const descriptionSchema = new Schema({
    bodyText: {
        type: String,
        required: true
    },
    mentions: [{
        type: String
    }],
    attachments: [
        {
            fileName: {type: String, required: true},
            fileUrl: {type: String, required: true},
            fileType: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        }
    ]
}, {timestamps: true});

const description = mongoose.model('Description', descriptionSchema);

const ticketSchema = new Schema({
    ticketNumber: {
        type: Number,
        required: true
    },

    title: {
        type: String,
        required: true,
    },

    description: descriptionSchema,

    ticketType: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        required: true,
        enum: validStatus,
        default: 'Open'
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

ticketSchema.pre('validate', async function () {
    if (!this.isNew) {
        return;
    }
    try {
        const ticketCounter = await counter.findOneAndUpdate(
            {modelName: 'Ticket'},
            {$inc: {sequenceValue: 1} },
            {returnDocument: "after", upsert: true}
        );
        
        this.ticketNumber = ticketCounter.sequenceValue;
    } catch (e) {
        throw e;
    }
});

const ticket = mongoose.model('Ticket', ticketSchema);
module.exports = {
    ticket,
    description
};