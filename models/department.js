const mongoose = require('mongoose');
const { Schema, SchemaTypes, model } = mongoose;

const departmentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    routingRules: {
        autoAssignStrategy: {
            type: String,
            enum: ['Manual', 'RoundRobin', 'LoadBalanced'],
            default: 'Manual'
        }
    },

    ticketTypes: [{
        typeName: { type: String, required: true },
        fields: [{
            name: {type: String},
            expectedType: {type: String, enum: ['String', 'Number', 'Dropdown', 'Boolean']},
            required: {type: Boolean, enum: [true, false]}
        }]
    }]
}, { timestamps: true });

const department = mongoose.model('Department', departmentSchema);
module.exports = department;