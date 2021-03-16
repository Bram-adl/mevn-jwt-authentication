const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const homeRouter = require('./routes/home');

// Initialize Database

mongoose
    .connect('mongodb://localhost:27017/express', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => console.log(`Connected to database`));

// Initialize Server

const app = express();
const port = process.env.PORT || 3000;

// Middlewares

app.use(express.json());
app.use(express.static(path.join(`${__dirname}/public`)));

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));