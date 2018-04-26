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
        let pollData = pch.parsePollData(poll);
        // Add poll_id to options passed to view
        pollData.poll_id = req.params.poll_id;
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
    (req, res, next) => {

        // Check the user hasn't voted on this poll before.
        if (req.user) {
            if (req.user.hasVotedFor(req.params.poll_id)) {
                req.flash('danger', "You've already voted on this poll and can't vote again.");
                return res.redirect('back');
            }
        } else if (req.session) {
            for (let sessionPollId of req.session.pollsVotedFor) {
                if (sessionPollId === req.params.poll_id) {
                    req.flash('danger', "You've already voted on this poll and can't vote again.");
                    return res.redirect('back');
                }
            }
        }

        // Otherwise, check cookie not voted

        // Vote
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
            });
        });
        // Store information no user, or store information on cookie.
    }
];

// function containsPollId(arr, id) {
//     for (let poll_id of arr) {
//         if (poll_id.equals(id)) {
//             return true;
//         }
//     }
//     return false;
// }
