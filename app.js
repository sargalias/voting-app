// Load environment variables for development
require('dotenv').config();

const express = require('express');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const db = require('./config/database');


const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}));

// Passport
require('./config/auth-google')(passport);
app.use(passport.initialize());
app.use(passport.session());


// Routes
// Index
app.use(require('./routes/index'));
// Polls
app.use('/polls', require('./routes/polls'));
// Passport
app.use('/auth/google', require('./routes/auth'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});
