const router = require('express').Router();


router.get('/', (req, res) => {
    res.render('polls/index');
});

router.get('/:id', (req, res) => {
    res.render('polls/show', {
        title: 'Who is your favorite superhero?',
        data: [20, 10, 5, 23],
        options: ["Superman", "Batman", "Wonder Woman", "The Flash"]
    });
});

module.exports = router;
