const { body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeBody } = require('express-validator/filter');
const Poll = require('../models/poll');


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

