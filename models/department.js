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
            expectedType: {type: String, enum: ['String', 'Number', 'Dropdown', 'Boolean'], required: true},
            required: {type: Boolean, enum: [true, false], required: true}
        }],
    }]
}, { timestamps: true });

const department = mongoose.model('Department', departmentSchema);
module.exports = department;