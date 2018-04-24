const router = require('express').Router();
const pollController = require('../controllers/polls');
const pc = pollController;


router.get('/', pc.index);

router.get('/new', pc.new);

router.post('/', pc.newPollValidation, pc.create);

router.get('/:id', pc.show);

module.exports = router;
