const { body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeBody } = require('express-validator/filter');
const Poll = require('../models/poll');
const User = require('../models/user');
const async = require('async');
const pch = pollControllerHelpers = require('../helpers/poll-controller');
const {POLLS_PER_PAGE} = require('../config/poll-pagination');
const mongoose = require('mongoose');


// Index
module.exports.index = (req, res, next) => {
    const pageNumber = pch.handlePageNumber(req, res, next);
    if (pageNumber === undefined) {
        return;
    }

    async.parallel({
        polls: function(callback) {
            Poll.find({})
                .sort({created_at: -1})
                .skip(pageNumber * POLLS_PER_PAGE)
                .limit(POLLS_PER_PAGE)
                .exec(callback);
        },
        count: function(callback) {
            Poll.find({})
                .count()
                .exec(callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        if (results.polls.length === 0) {
            err = new Error('This page has no polls');
            err.status = 404;
            return next(err);
        }
        res.render('polls/index', {
            polls: results.polls,
            pageNumber: pageNumber,
            totalPages: Math.ceil(results.count / POLLS_PER_PAGE)
        });
    });
};

// New
module.exports.new = (req, res, next) => {
    res.render('polls/new');
};

// Create
module.exports.create = [pch.pollValidationPrep];
pch.newPollValidation.forEach((middleware) => {
    module.exports.create.push(middleware);
});
module.exports.create.push(pch.createPoll);
// Create end


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


// Update poll middleware
module.exports.update = [
    pch.pollValidationPrep
];
pch.editPollValidation.forEach((middleware) => {
    module.exports.update.push(middleware);
});
module.exports.update.push(pch.updatePoll);


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
