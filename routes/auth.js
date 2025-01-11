const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const requireLogin = require("../middleware/requireLogin");
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { SENDGRID_API, EMAIL } = require('../config/keys');

// Create transporter for sending emails via SendGrid
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SENDGRID_API
    }
}));

// Signup route
router.post("/signup", async (req, res) => {
    const { name, email, password, pic } = req.body;
    if (!name || !email || !password) {
        return res.status(404).json({ error: "Please add the empty fields also." });
    }
    try {
        const savedUser = await User.findOne({ email: email });
        if (savedUser) {
            return res.status(404).json({ error: "User already exists." });
        }

        const hashedpassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            password: hashedpassword,
            name,
            pic
        });
        const result = await user.save();

        // Send email after signup
        // transporter.sendMail({
        //     to: result.email,
        //     from: "sakshamtolani@gmail.com",
        //     subject: "Account signup successful",
        //     html: `<h1>Congratulations! You just signed up successfully.</h1>
        //            <p>You're almost set to start using Instabyte. Welcome to Instabyte, ${result.name}.</p>
        //            <br>Cheers,<br>- The Instabyte Team
        //            <br><img src="https://res.cloudinary.com/sakshamtolani/image/upload/v1638594772/favicon_gerie5.jpg" height="100px"/>`
        // });

        res.json({ message: "User saved successfully!!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Signin route
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Please enter email and password." });
    }
    try {
        const savedUser = await User.findOne({ email: email });
        if (!savedUser) {
            return res.status(404).json({ error: "Enter correct email or password." });
        }

        const doMatch = await bcrypt.compare(password, savedUser.password);
        if (doMatch) {
            const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
            const { _id, name, email, followers, following, pic } = savedUser;
            res.json({ token, user: { _id, name, email, followers, following, pic } });
        } else {
            return res.status(404).json({ error: "Enter correct email or password." });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Reset password route
router.post("/reset-password", async (req, res) => {
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
            console.log(err);
        }
        const token = buffer.toString("hex");
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(422).json({ error: "User does not exist with the provided email id" });
            }
            user.resetToken = token;
            user.expireToken = Date.now() + 3600000;
            await user.save();

            // Send reset password email
            transporter.sendMail({
                to: user.email,
                from: "sakshamtolani@gmail.com",
                subject: "Reset password",
                html: `<p>Hi, ${user.name}.
                       You received this email because you have requested to reset password for your Instabyte account.
                       <br>To reset your password, 
                       <a href="${EMAIL}/reset/${token}">Click here</a>
                       <br>Cheers,<br>- The Instabyte Team
                       <br><img src="https://res.cloudinary.com/sakshamtolani/image/upload/v1638594772/favicon_gerie5.jpg" height="100px"/>`
            });
            res.json({ message: "Please have a look at your mails." });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Server error" });
        }
    });
});

// Set new password route
router.post('/new-password', async (req, res) => {
    const newPassword = req.body.password;
    const sentToken = req.body.token;
    try {
        const user = await User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } });
        if (!user) {
            return res.status(422).json({ error: "Try again session expired" });
        }
        const hashedpassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        const saveduser = await user.save();

        // Send confirmation email for password change
        transporter.sendMail({
            to: user.email,
            from: "sakshamtolani@gmail.com",
            subject: "Password change successful",
            html: `Hello, 
                   <br>- This is a confirmation that the password for your account '${saveduser.email}' has just been changed.
                   <br>Cheers,<br>- The Instabyte Team
                   <br><img src="https://res.cloudinary.com/sakshamtolani/image/upload/v1638594772/favicon_gerie5.jpg" height="100px"/>`
        });
        res.json({ message: "Password changed Successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
