const router = require('express').Router();
const pc = pollController = require('../controllers/polls');
const ut = utility = require('../utility/utility');


router.get('/', pc.index);

router.get('/new', ut.isLoggedInMessage("You need to be logged in to create new polls."), pc.new);

router.post('/', ut.isLoggedInMessage("Not authorized"), pc.newPollValidation, pc.create);

router.get('/:id', pc.show);

module.exports = router;
