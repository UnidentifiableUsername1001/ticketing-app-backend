const mongoose = require('mongoose');
const { Schema, SchemaTypes, model } = mongoose;

const newCounter = new Schema({
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

const counter = mongoose.model('Counter', newCounter);
module.exports = counter;