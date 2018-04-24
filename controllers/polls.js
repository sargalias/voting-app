const { body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeBody } = require('express-validator/filter');
const Poll = require('../models/poll');
const User = require('../models/user');
const async = require('async');


module.exports.index = (req, res, next) => {
    Poll.find({}, (err, polls) => {
        if (err) {
            return next(err);
        }
        res.render('polls/index', {polls: polls});
    });
};

module.exports.new = (req, res, next) => {
    res.render('polls/new');
};

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

module.exports.show = (req, res, next) => {
    res.render('polls/show', {
        title: 'Who is your favorite superhero?',
        data: [20, 10, 5, 23],
        options: ["Superman", "Batman", "Wonder Woman", "The Flash"]
    });
};


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
