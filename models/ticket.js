import mongoose from 'mongoose';
const { Schema, SchemaTypes, model } = mongoose;
import { counter } from '../models/counter';
import { auditPlugin } from '../mongoPlugins/plugins';

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

    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
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

ticketSchema.index({companyId: 1, departmentId: 1, status: 1, ticketType: 1, assignedTo: 1,});

ticketSchema.plugin(auditPlugin);

ticketSchema.pre('validate', async function () {
    if (!this.isNew) {
        return;
    }
    try {
        const ticketCounter = await counter.findOneAndUpdate(
            {
                modelName: 'Ticket',
                companyId: this.companyId
            },
            {$inc: {sequenceValue: 1} },
            {returnDocument: "after", upsert: true}
        );
        
        this.ticketNumber = ticketCounter.sequenceValue;
    } catch (e) {
        console.log(e);
    }
});

const description = mongoose.model('Description', descriptionSchema);
const ticket = mongoose.model('Ticket', ticketSchema);

export {
    ticket,
    description
};