const Poll = require('../models/poll');
const User = require('../models/user');


function isLoggedIn(req, res, next) {
    if (req.user) {
        return next();
    }
    else {
        req.flash('danger', 'Not authorized');
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
    Poll.findById(req.params.poll_id)
        .populate('author', '_id')
        .exec((err, poll) => {
            if (err || !poll) {
                err = new Error('Poll not found');
                err.status(404);
                return next(err);
            }
            if (poll.user._id.equals(req.user.id)) {
                return next();
            }
            err = new Error('Not authorized');
            err.status(500);
            return next(err);
        });
}


module.exports.isLoggedInMessage = isLoggedInMessage;
module.exports.isLoggedIn = isLoggedIn;
module.exports.userOwnsPoll = userOwnsPoll;
