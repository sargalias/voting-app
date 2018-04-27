const { body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeBody } = require('express-validator/filter');
const Poll = require('../models/poll');
const User = require('../models/user');
const async = require('async');
const pch = pollControllerHelpers = require('../helpers/poll-controller');
const mongoose = require('mongoose');


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
module.exports.create = [];
pch.newPollValidation.forEach((middleware) => {
    module.exports.create.push(middleware);
});
module.exports.create.push(createPoll);
// Create end

function createNewPollParent(data, req) {
    return function(callback) {
        let newPoll = Poll({});
        newPoll.title = data.title;
        newPoll.results = [];
        newPoll.user = req.user;
        data.options.forEach((option) => {
            newPoll.results.push({option: option});
        });
        callback(null, newPoll);
    }
}

function createPoll(req, res, next) {
    const errors = validationResult(req);
    const data = matchedData(req);
    if (!errors.isEmpty()) {
        return res.render('polls/new', {errors: errors.array(), data: data});
    }
    async.waterfall([
        // Create poll, hasn't been saved yet
        createNewPollParent(data, req),

        // Save newPoll + add to user and save user.
        function(newPoll, callback) {
            async.parallel({
                savePoll: function(callback) {
                    newPoll.save(callback);
                },
                updateUser: function(callback) {
                    req.user.polls.push(newPoll);
                    req.user.save(callback);
                }
            }, function(err, results) {
                callback(err, results);
            });
        }
    ], function(err, results) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Poll created');
        res.redirect('/my-polls');
    });
}

// Show
module.exports.show = (req, res, next) => {
    Poll.findById(req.params.poll_id, (err, poll) => {
        if (err) {
            return next(err);
        }
        if (!poll) {
            err = new Error('Poll could not be found');
            err.status = 404;
            return next(err);
        }
        let pollData = pch.parsePollData(poll);
        // Add poll_id to options passed to view
        pollData.poll_id = req.params.poll_id;
        pollData.poll_url = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.render('polls/show', pollData);
    });
};

// Edit
module.exports.edit = (req, res, next) => {
    Poll.findById(req.params.poll_id, (err, poll) => {
        if (err) {
            return next(err);
        }
        if (!poll) {
            let err = new Error('Poll not found');
            err.status = 404;
            return next(err);
        }
        res.render('polls/edit', {poll: poll});
    });
};



// Edit poll middleware
module.exports.update = [
    pch.editPollPrep
];
pch.editPollValidation.forEach((middleware) => {
    module.exports.update.push(middleware);
});
module.exports.update.push(updatePoll);


function updatePoll(req, res, next) {
    const errors = validationResult(req);
    const data = matchedData(req);
    Poll.findById(req.params.poll_id, (err, poll) => {
        if (err) {
            return next(err);
        }
        if (!poll) {
            let err = new Error('Poll could not be found');
            err.status = 404;
            return next(err);
        }
        if (!errors.isEmpty()) {
            return res.render('polls/edit', {errors: errors.array(), poll: poll, data: data});
        }
        data.options.forEach((option) => {
            poll.results.push({option: option});
        });
        poll.save((err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/my-polls');
        });
    });
}

// Delete
module.exports.delete = (req, res, next) => {
    async.parallel({
        delUserPoll: pch.deleteUserPollParent(req),
        delPoll: pch.deletePollParent(req)
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Poll deleted');
        res.redirect('/');
    });
};


// Vote
module.exports.vote = [
    body('option').trim()
        .isLength({min: 1}).withMessage('Option is required')
    ,
    sanitizeBody('option').trim().escape()
    ,
    pch.hasAlreadyVoted,
    pch.vote,
    pch.recordUserVote
];
