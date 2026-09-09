import mongoose from 'mongoose';
const { Schema, SchemaTypes, model } = mongoose;
import { auditPlugin } from '../mongoPlugins/plugins';

const commentSchema = new Schema({

    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },

    ticketId: {
        type: Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true,
        index: true
    },

    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    bodyText: {
        type: String,
        required: true
    },
    mentions: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
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

commentSchema.index({ticketId: 1, postedBy: 1});

commentSchema.plugin(auditPlugin);

const comments = mongoose.model('Comment', commentSchema);

export {
    comments
}