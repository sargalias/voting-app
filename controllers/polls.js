const { body, validationResult } = require('express-validator/check');
const { matchedData, sanitizeBody } = require('express-validator/filter');


module.exports.index = (req, res, next) => {
    res.render('polls/index');
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
    console.log(data);
    res.redirect('/polls');
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
