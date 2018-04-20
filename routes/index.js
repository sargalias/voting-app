const router = require('express').Router();


router.get('/', (req, res) => {
    res.redirect('/polls');
});

module.exports = router;
