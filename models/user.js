const mongoose = require('mongoose')
const { Schema, SchemaTypes, model } = mongoose;

const validPermissions = ["Admin", "mgtUser", "stdUser"];

const userSchema = new Schema ({
    _id: Schema.Types.ObjectId,
    
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
    permissionLevel: [{
        type: String,
        required: false,
        enum: validPermissions,
    }],
}, {
    timestamps: true
});


const user = mongoose.model('User', userSchema);

module.exports = user;