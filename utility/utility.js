function isLoggedIn(req, res, next) {
    if (req.user) {
        return next();
    }
    else {
        req.flash('danger', 'Not authorized');
        res.redirect('/');
    }
}

function isLoggedInMessage(message) {
    return function isLoggedIn(req, res, next) {
        if (req.user) {
            return next();
        }
        else {
            req.flash('danger', message);
            res.redirect('/');
        }
    }
}

module.exports.isLoggedInMessage = isLoggedInMessage;

module.exports.isLoggedIn = isLoggedIn;
