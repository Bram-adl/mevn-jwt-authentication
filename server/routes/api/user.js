// @ts-nocheck
const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../../models/User');

// API Routes - User

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById({ _id: mongoose.Types.ObjectId(req.params.id) });
        if (!user) return res.status(404).send({ success: false, message: 'The specified resource is not found.' });

        return res.status(200).send({ 
            success: true, 
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).send({ success: false, message: 'Unknown error ocurred.' });
    }
});

module.exports = router;