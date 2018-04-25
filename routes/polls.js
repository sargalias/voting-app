const router = require('express').Router();
const pc = pollController = require('../controllers/polls');
const ut = utility = require('../utility/utility');


router.get('/', pc.index);

router.get('/new', ut.isLoggedInMessage("Log in to create new polls."), pc.new);

router.post('/', ut.isLoggedInMessage("Not authorized"), pc.newPollValidation, pc.create);

router.get('/:id', pc.show);

router.get('/:id/edit', ut.isLoggedInMessage('Not authorized, please login'), pc.edit);

router.put('/:id',
    ut.isLoggedInMessage('Not authorized, please login'),
    pc.editPollPrep,
    pc.editPollValidation,
    pc.update
);

router.delete('/:id',
    ut.isLoggedInMessage('Not authorized'),
    pc.delete);

module.exports = router;
