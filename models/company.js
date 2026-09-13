import mongoose from 'mongoose';
const { Schema, SchemaTypes, model } = mongoose;
import { auditPlugin } from '../mongoPlugins/plugins.js';

const companySchema = new Schema({

    companyName: {
        type: String,
        required: true
    },

    numberOfEmployees: {
        type: Number,
        required: true
    },

    companyAddress: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const company = mongoose.model('Company', companySchema);

export { company };