const router = require('express').Router();


// 404 not found
router.get('*', (req, res, next) => {
    let err = new Error('Page not found');
    err.status = 404;
    return next(err);
});

// Error
router.use((err, req, res, next) => {
    res.render('index/error', {error: err});
});


module.exports = router;
