const Poll = require('../models/poll');
const User = require('../models/user');


function isLoggedIn(req, res, next) {
    if (req.user) {
        return next();
    }
    else {
        req.flash('danger', 'Not authorized, please login');
        res.redirect('/');
    }
}

function isLoggedInMessage(message) {
    return function isLoggedIn(req, res, next) {
        if (req.user) {
            return next();
        }
        else {
            req.flash('danger', message);
            res.redirect('/');
        }
    }
}

function userOwnsPoll(req, res, next) {
    // Assumes req.params.poll_id exists
    // Assumes req.user exists
    for (let pollId of req.user.polls) {
        if (pollId.equals(req.params.poll_id)) {
            return next();
        }
    }
    let err = new Error('Not authorized');
    err.status = 500;
    return next(err);
}


module.exports.isLoggedInMessage = isLoggedInMessage;
module.exports.isLoggedIn = isLoggedIn;
module.exports.userOwnsPoll = userOwnsPoll;
