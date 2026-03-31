import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const validPermissions = ["Admin", "mgtUser", "stdUser"];

const userSchema= new Schema ({
    jobTitle: {
        type: String,
        required: true
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
        required: true,
        enum: validPermissions,
    }],
}, {
    timestamps: true
});

const User = model('User', userSchema);
export default User;