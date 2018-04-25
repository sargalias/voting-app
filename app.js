// Load environment variables for development
require('dotenv').config();

const express = require('express');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const db = require('./config/database');


const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Method override
app.use(methodOverride('_method'));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: process.env.NODE_ENV === 'production'}
}));

// Connect flash and express messages
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport
require('./config/auth-google')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user;
    next()
});


// Routes
const indexRoutes = require('./routes/index');
const pollRoutes = require('./routes/polls');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
app.use('/', indexRoutes);
app.use('/polls', pollRoutes);
app.use('/', authRoutes);
app.use('/my-polls', userRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});
