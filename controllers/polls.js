const { body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeBody } = require('express-validator/filter');
const Poll = require('../models/poll');
const User = require('../models/user');
const async = require('async');
const ObjectId = require('mongoose').Types.ObjectId;


// Index
module.exports.index = (req, res, next) => {
    Poll.find({}, (err, polls) => {
        if (err) {
            return next(err);
        }
        res.render('polls/index', {polls: polls});
    });
};

// New
module.exports.new = (req, res, next) => {
    res.render('polls/new');
};

// Create
module.exports.create = (req, res, next) => {
    const errors = validationResult(req);
    const data = matchedData(req);
    if (!errors.isEmpty()) {
        return res.render('polls/new', {errors: errors.array(), data: data});
    }
    // Validation passed.
    async.waterfall([
        function(callback) {
            User.findById(req.user._id, callback);
        },
        function(user, callback) {
            if (!user) {
                error = new Error('User not found.');
                return next(error);
            }
            let newPoll = {} = new Poll({});
            newPoll.title = data.title;
            newPoll.results = [];
            newPoll.user = req.user;
            data.options.forEach((option) => {
                newPoll.results.push({option: option});
            });
            callback(null, {newPoll: newPoll, user: user});
        }
    ], function(err, {newPoll, user}) {
        if (err) {
            return next(err);
        }
        async.parallel({
            savePoll: function(callback) {
                newPoll.save(callback);
            },
            saveUser: function(callback) {
                user.polls.push(newPoll);
                user.save(callback);
            }
        }, function(err, results) {
            if (err) {
                return next(err);
            }
            return res.redirect('/polls/' + results.savePoll.id);
        });
    });
};

// Show
module.exports.show = (req, res, next) => {
    Poll.findById(req.params.id, (err, poll) => {
        if (err) {
            return next(err);
        }
        let pollData = parsePollData(poll);
        console.log(pollData);
        res.render('polls/show', pollData);
    });
};

function parsePollData(poll) {
    let pollData = {};
    pollData.title = poll.title;
    pollData.data = [];
    pollData.options = [];
    poll.results.forEach((result) => {
        pollData.data.push(result.votes);
        pollData.options.push(result.option);
    });
    return pollData;
}

module.exports.newPollValidation = [
    body('title').trim()
        .isLength({min: 1}).withMessage('Title is required')
    ,
    body('options')
        .isArray().withMessage('Invalid format for options')
        .isLength({min: 2}).withMessage('There must be at least 2 options')
    ,
    body('options.*').trim()
        .isLength({min: 1}).withMessage('All option fields must have a value')
    ,
    sanitizeBody('title').trim().escape(),
    sanitizeBody('options.*').trim().escape(),
];

// Delete
module.exports.delete = (req, res, next) => {
    async.waterfall([
        function(callback) {
            User.findById(req.user.id)
                .populate('polls')
                .exec(callback);
        }
    ], function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('User not found, please login')
            return res.redirect('/');
        }
        let indexToDelete = null;
        user.polls.forEach((poll, i) => {
            if (poll._id.equals(req.params.id)) {
                indexToDelete = i;
            }
        });
        if (indexToDelete !== null) {
            async.parallel({
                userSave: function(callback) {
                    user.polls.splice(indexToDelete, 1);
                    user.save((callback));
                },
                pollDelete: function(callback) {
                    Poll.findByIdAndRemove(req.params.id, callback);
                }

            }, function(err, results) {
                if (err) {
                    return next(err);
                }
                res.redirect('/my-polls');
            });
        }
        else {
            return next(new Error('Poll not found'));
        }
    });
};

module.exports.edit = (req, res, next) => {
    Poll.findById(req.params.id)
        .populate('user', '_id')
        .exec((err, poll) => {
            if (err) {
                return next(err);
            }
            if (!poll) {
                req.flash('Poll not found');
                return res.redirect('/');
            }
            // Ensure correct user.
            // Bring up edit poll view thing.
            // if (poll.user._id.equals(req.user.id)) {
                res.render('polls/edit', {poll: poll});
            // } else {
            //     req.flash('Not authorized');
            //     res.redirect('/');
            // }
    });
};