const router = require('express').Router();


router.get('/', (req, res) => {
    req.flash('success', 'Test message');
    res.render('polls/index');
});

router.get('/new', (req, res) => {
    res.render('polls/new');
});

router.post('/', (req, res) => {
    res.render('polls/new');
});

router.get('/:id', (req, res) => {
    res.render('polls/show', {
        title: 'Who is your favorite superhero?',
        data: [20, 10, 5, 23],
        options: ["Superman", "Batman", "Wonder Woman", "The Flash"]
    });
});

module.exports = router;
