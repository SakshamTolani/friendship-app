const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    name: {
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
    resetToken: String,
    expireToken: Date,
    pic: {
        type: String,
        default: "https://res.cloudinary.com/sakshamtolani/image/upload/v1637816425/depositphotos_39258143-stock-illustration-businessman-avatar-profile-picture_ijh7lz.jpg"
    },
    friends: [{
        type: ObjectId,
        ref: "User"
    }],
    friendRequests: [{
        from: {
            type: ObjectId,
            ref: "User"
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    sentRequests: [{
        to: {
            type: ObjectId,
            ref: "User"
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
})

mongoose.model("User", userSchema);