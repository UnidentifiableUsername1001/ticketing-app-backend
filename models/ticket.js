import mongoose from "mongoose";
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
    createdby: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
});

const Ticket = model('Ticket', ticketSchema);
export default Ticket