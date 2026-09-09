import mongoose from 'mongoose';
const { Schema, SchemaTypes, model } = mongoose;
import { auditPlugin } from '../mongoPlugins/plugins';

const departmentSchema = new Schema({

    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },

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
            expectedType: {type: String, required: true},
            dataSource: {type: String, required: false},
            required: {type: Boolean, required: true}
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

departmentSchema.plugin(auditPlugin);

const department = mongoose.model('Department', departmentSchema);

export {
    department
};