const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(`${__dirname}/public`)));

app.use('/', require('./routes/home'));
app.use('/api', require('./routes/api/auth'));
app.use('/api/user', require('./routes/api/user'));

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));