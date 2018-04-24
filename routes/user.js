const router = require('express').Router();
const ut = utility = require('../utility/utility');


router.get('/', ut.isLoggedInMessage('Login to see your polls'), (req, res) => {
    res.render('users/index');
});

module.exports = router;
