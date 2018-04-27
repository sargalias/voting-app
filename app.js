// Load environment variables for development
require('dotenv').config();

const express = require('express');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const MemoryStore = require('memorystore')(session);
const db = require('./config/database');
const helmet = require('helmet');
const compression = require('compression');


const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Helmet
app.use(helmet());

// Compression
app.use(compression());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Method override
app.use(methodOverride('_method'));

// Session
let sess = {
    store: new MemoryStore({
        checkPeriod: 1000 * 60 * 60 * 24,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        domain: process.env.DOMAIN_URI
    }
};
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
}
app.use(session(sess));

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


// Middleware for poll voting functionality
app.use((req, res, next) => {
    req.session.pollsVotedFor = req.session.pollsVotedFor || [];
    next();
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

// Catch all route
app.get('*', (req, res, next) => {
    let err = new Error('Page not found');
    err.status = 404;
    return next(err);
});

// Error handler
app.use((err, req, res, next) => {
    res.render('index/error', {error: err});
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});
