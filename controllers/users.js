const User = require('../models/user');


module.exports.index = (req, res, next) => {
    User.findById(req.user.id)
        .populate('polls')
        .exec((err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                err = new Error('User not found');
                return next(err);
            }
            res.render('users/index', {user: user});
        });
};