const { body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeBody } = require('express-validator/filter');
const Poll = require('../models/poll');
const User = require('../models/user');
const async = require('async');


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

// Create
module.exports.create = (req, res, next) => {
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
};

// Show
module.exports.show = (req, res, next) => {
    Poll.findById(req.params.poll_id, (err, poll) => {
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

function deleteUserPollParent(req) {
    return function(callback) {
        let indexToDelete = null;
        req.user.polls.forEach((pollId, i) => {
            if (pollId.equals(req.params.poll_id)) {
                indexToDelete = i;
            }
        });
        if (indexToDelete !== null) {
            req.user.polls.splice(indexToDelete, 1);
        }
        console.log('index to delete: ' + indexToDelete);
        console.log(req.user);
        req.user.save(callback);
    }
}

function deletePollParent(req) {
    return function(callback) {
        Poll.findByIdAndRemove(req.params.poll_id, callback);
    }
}

// Delete
module.exports.delete = (req, res, next) => {
    async.parallel({
        delUserPoll: deleteUserPollParent(req),
        delPoll: deletePollParent(req)
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Poll deleted');
        res.redirect('/');
    });
};

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

module.exports.update = (req, res, next) => {
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
};


module.exports.editPollPrep = (req, res, next) => {
    if (req.body && !Array.isArray(req.body.options)) {
        req.body.options = [req.body.options];
    }
    next();
};


module.exports.newPollValidation = [
    body('title').trim()
        .isLength({min: 1}).withMessage('Title is required')
    ,
    body('options')
        .isArray().withMessage('Invalid format for options')
        .custom((val, {req}) => {return val.length >=2}).withMessage('There must be at least 2 options')
    ,
    body('options.*').trim()
        .isLength({min: 1}).withMessage('All option fields must have a value')
    ,
    sanitizeBody('title').trim().escape(),
    sanitizeBody('options.*').trim().escape(),
];

module.exports.editPollValidation = [
    body('options')
        .isArray().withMessage('Invalid format for options')
        .custom((val, {req}) => {return val.length >=1}).withMessage('There must be at least 1 option')
    ,
    body('options.*').trim()
        .isLength({min: 1}).withMessage('All option fields must have a value')
    ,
    sanitizeBody('options.*').trim().escape(),
];