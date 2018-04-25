const router = require('express').Router();
const pc = pollController = require('../controllers/polls');
const ut = utility = require('../utility/utility');


router.get('/', pc.index);

router.get('/new', ut.isLoggedInMessage("Log in to create new polls."), pc.new);

router.post('/', ut.isLoggedInMessage("Not authorized"), pc.newPollValidation, pc.create);

router.get('/:poll_id', pc.show);

router.get('/:poll_id/edit',
    ut.isLoggedInMessage('Not authorized, please login'),
    ut.userOwnsPoll,
    pc.edit
);

router.put('/:poll_id',
    ut.isLoggedInMessage('Not authorized, please login'),
    ut.userOwnsPoll,
    pc.editPollPrep,
    pc.editPollValidation,
    pc.update
);

router.delete('/:poll_id',
    ut.isLoggedInMessage('Not authorized'),
    ut.userOwnsPoll,
    pc.delete
);

module.exports = router;
