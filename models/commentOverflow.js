const mongoose = require('mongoose');
const ticket = require('./ticket');
const { Schema, SchemaTypes, model } = mongoose;

const commentOverflow = new Schema ({
    text: {type: String, required: true},
    postedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdAt: {type: Date, default: Date.now},
    relatedTicket: {type: Schema.Types.ObjectId, ref: 'Ticket'}
});

commentOverflow.index({ relatedTicket: 1, createdAt: -1});

const overflow = mongoose.model('Overflow', commentOverflow);
module.exports = overflow;