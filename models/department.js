const mongoose = require('mongoose');
const { Schema, SchemaTypes, model } = mongoose;

const departmentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    ticketTypes: [{
        typeName: { type: String, required: true },
        fields: [{
            name: {type: String, required: true},
            expectedType: {type: String, enum: ['String', 'Number', 'Array', 'Boolean'], required: true},
            dataSource: {type: String, required: false},
            required: {type: Boolean, enum: [true, false], required: true}
        }],
    }],

    config: {
        assignmentStrategy: {
            type: String,
            enum: ['Load Balance', 'Manual'],
            required: true
        }
    }
}, { timestamps: true });

const department = mongoose.model('Department', departmentSchema);
module.exports = department;