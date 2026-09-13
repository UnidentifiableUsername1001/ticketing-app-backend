import mongoose from 'mongoose';
const { Schema, SchemaTypes, model } = mongoose;
import { auditPlugin } from '../mongoPlugins/plugins.js';

const newCounter = new Schema({

    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },

    modelName: {
        type: String,
        enum: ['Ticket'],
        unique: true,
        required: true,
    },

    sequenceValue: {
        type: Number,
        default: 0,
        required: true,
    }
});

newCounter.plugin(auditPlugin)

const counter = mongoose.model('Counter', newCounter);
export {
    counter
}