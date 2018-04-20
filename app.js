// Load environment variables for development
require('dotenv').config();

const express = require('express');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');

// Mongoose and MongoDB
const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI);
mongoose.connect('mongodb://localhost/fcc_voting_app');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));



const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/test', (req, res) => {
    res.render('polls/index');
});

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

// Passport routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/');
    });







const testPoll = {
    title: 'Who is your favorite superhero',
    results: [
        {option: 'Batman', votes: 20},
        {option: 'Superman', votes: 10},
        {option: 'Wonder Woman', votes: 5},
        {option: 'The Flash', votes: 23},
    ]
};

app.get('/test2', (req, res) => {
    res.render('polls/show', {
        data: [20, 10, 5, 23],
        colors: ["#000", "#333", "#555", "#999"],
        labels: ["Superman", "Batman", "Wonder Woman", "The Flash"]
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});
