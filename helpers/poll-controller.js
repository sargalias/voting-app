const { body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeBody } = require('express-validator/filter');
const Poll = require('../models/poll');
const async = require('async');


module.exports.handlePageNumber = (req, res, next) => {
    // Comes from route /polls and /polls/page/:pageNumber
    let pageNumber = req.params.pageNumber;
    if (pageNumber === undefined) {
        return 0;
    }
    pageNumber = parseInt(req.params.pageNumber);
    if (pageNumber < 1) {
        let err = new Error('Page number must be at least 1');
        err.status = 403;
        next(err);
        return;
    }
    pageNumber--;
    return pageNumber;
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

module.exports.createPoll = (req, res, next) => {
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

module.exports.editPollPrep = (req, res, next) => {
    if (req.body && !Array.isArray(req.body.options)) {
        req.body.options = [req.body.options];
    }
    next();
};

module.exports.parsePollData = (poll) => {
    let pollData = {};
    pollData.title = poll.title;
    pollData.data = [];
    pollData.options = [];
    poll.results.forEach((result) => {
        pollData.data.push(result.votes);
        pollData.options.push(result.option);
    });
    return pollData;
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


module.exports.updatePoll = (req, res, next) => {
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

module.exports.deleteUserPollParent = (req) => {
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
};

module.exports.deletePollParent = (req) => {
    return function(callback) {
        Poll.findByIdAndRemove(req.params.poll_id, callback);
    }
};

module.exports.hasAlreadyVoted = (req, res, next) => {
    let hasVoted = false;
    if (req.user) {
        hasVoted = req.user.hasVotedFor(req.params.poll_id);
    } else {
        for (let sessionPollId of req.session.pollsVotedFor) {
            if (sessionPollId === req.params.poll_id) {
                hasVoted = true;
            }
        }
    }
    if (hasVoted) {
        req.flash('danger', "You've already voted on this poll and can't vote again.");
        return res.redirect('back');
    }
    next();
};

module.exports.recordUserVote = (req, res, next) => {
    if (req.user) {
        req.user.addVotedFor(req.params.poll_id, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('back');
        });
    } else {
        req.session.pollsVotedFor.push(req.params.poll_id);
        res.redirect('back');
    }
};

module.exports.vote = (req, res, next) => {
    const {option} = matchedData(req);
    Poll.findById(req.params.poll_id, (err, poll) => {
        if (!poll.containsOption(option)) {
            req.flash('danger', 'Poll option not found');
            return res.redirect('back');
        }
        poll.voteForOption(option);
        poll.save((err) => {
            if (err) {
                return next(err);
            }
            next();
        });
    });
};

