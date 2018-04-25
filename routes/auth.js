const router = require('express').Router();
const passport = require('passport');

router.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/my-polls');
    });

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
