const mongoose = require('mongoose')
const { Schema, SchemaTypes, model } = mongoose;

const validPermissions = ["Admin", "Manager", "User"];

const userSchema = new Schema ({

    jobTitle: {
        type: String,
        required: false
    },

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    passwordResetRequired: {
        type: Boolean,
        require: true,
        default: true,
    },

    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },

    role: {
        type: String,
        required: true,
        enum: validPermissions,
        default: 'User'
    },
}, {
    timestamps: true
});

userSchema.index({departmentId: 1, role: 1, jobTitle: 1});

const user = mongoose.model('User', userSchema);

module.exports = user;