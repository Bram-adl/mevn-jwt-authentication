// @ts-nocheck
const bcrypt = require('bcrypt');
const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../../models/User');

// Config

const TOKEN_SECRET = process.env.TOKEN_SECRET || '$eybghwj*@&cb61923^&VGb1&YI012ywsgrh*@1nc03!bc21t13ry03';

// API Routes - Authentication

router.post('/login', async (req, res) => {
    try {
        const { error } = validateLoginRequest(req.body);
        if (error) return res.status(400).send({ success: false, message: error.details[0].message });

        let { email, password } = req.body;
        email = email.toLowerCase();

        const user = await User.findOne({ email });
        if (!user) return res.status(404).send({ success: false, message: 'User is not found.' });
        
        const userPassword = user.password;
        const isPasswordMatches = await bcrypt.compare(password, userPassword);
        if (!isPasswordMatches) return res.status(400).send({ success: false, message: 'Password does not match.' });

        const token = jwt.sign({
            id: user._id,
            username: user.username,
        }, TOKEN_SECRET);
        
        res.status(200).send({ success: true, data: { token, user } });
    } catch (error) {
        res.status(500).send({ status: false, message: 'Unknown error occured.' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { error } = validateRegisterRequest(req.body);
        if (error) return res.status(400).send({ success: false, message: error.details[0].message });

        let { username, email, password } = req.body;
        email = email.toLowerCase();
        password = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password,
        });

        if (!user) return res.status(500).send({ success: false, message: 'Unknown error occured.' });
        res.status(201).send({ success: true, data: user });
    } catch (error) {
        if (error.code === 11000) return res.status(400).send({ success: false, message: 'Email has been registered.' });
        res.status(500).send({ status: false, message: 'Unknown error occured.' });
    }
});

router.put('/change_password', async (req, res) => {
    try {
        const { error } = validateChangePasswordRequest(req.body);
        if (error) return res.status(404).send({ success: false, message: error.details[0].message });
        
        let { oldPassword, newPassword, token } = req.body;
        newPassword = await bcrypt.hash(newPassword, 10)
        const userToken = jwt.verify(token, TOKEN_SECRET);
        const _id = userToken.id;
        
        const user = await User.findById({ _id });
        if (!user) return res.status(404).send({ success: false, message: 'The specified resource is not found.' });

        const userOldPassword = user.password;
        const isOldPasswordMatch = await bcrypt.compare(oldPassword, userOldPassword);
        if (!isOldPasswordMatch) return res.status(400).send({ success: false, message: 'The password did not match the old one.' });
        
        const response = await User.findOneAndUpdate({ _id }, {
            $set: { password: newPassword },
        });
        
        res.status(201).send({ success: true, data: response });
    } catch (err) {
        console.log(err)
        res.status(500).send({ success: false, message: err })
    }
});

// Validation Functions

function validateLoginRequest(user) {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.base': 'Email should be a string.',
                'string.empty': 'Email should not be empty.',
                'string.email': 'Email is not valid.',
                'any.required': 'Email is required.',
            }),

        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .required()
            .messages({
                'string.base': 'Password should be a string.',
                'string.empty': 'Password should not be empty.',
                'any.required': 'Password is required.',
            }),
    });

    return schema.validate(user);
}

function validateRegisterRequest(user) {
    const schema = Joi.object({
        username: Joi.string()
            .required()
            .messages({
                'string.base': 'Username should be a string.',
                'string.empty': 'Username should not be empty',
                'any.required': 'Username is required ',
            }),
        
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.base': 'Email should be a string.',
                'string.empty': 'Email should not be empty.',
                'string.email': 'Email is not valid.',
                'any.required': 'Email is required.',
            }),

        password: Joi.string()
            .min(4)
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .required()
            .messages({
                'string.base': 'Password should be a string.',
                'string.empty': 'Password should not be empty.',
                'string.min': 'Password must be at least 4 characters',
                'any.required': 'Password is required.',
            }),
    });

    return schema.validate(user);
}



function validateChangePasswordRequest(password) {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .required()
            .messages({
                'string.base': 'Old Password must be a string.',
                'string.empty': 'Old Password should not be empty.',
                'any.required': 'Old Password is required',
            }),

        newPassword: Joi.string()
            .required()
            .messages({
                'string.base': 'New Password must be a string.',
                'string.empty': 'New Password should not be empty.',
                'any.required': 'New Password is required',
            }),

        token: [
            Joi.string(),
            Joi.number()
        ],
    });

    return schema.validate(password);
}

module.exports = router;