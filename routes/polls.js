const router = require('express').Router();
const pc = pollController = require('../controllers/polls');
const ah = authHelpers = require('../helpers/auth');


router.get('/', pc.index);

router.get('/new', ah.isLoggedInMessage("Log in to create new polls."), pc.new);

router.post('/', ah.isLoggedInMessage("Log in to create new polls"), pc.create);

router.get('/:poll_id', pc.show);

router.get('/:poll_id/edit',
    ah.isLoggedIn,
    ah.userOwnsPoll,
    pc.edit
);

router.put('/:poll_id',
    ah.isLoggedIn,
    ah.userOwnsPoll,
    pc.update
);

router.delete('/:poll_id',
    ah.isLoggedIn,
    ah.userOwnsPoll,
    pc.delete
);

module.exports = router;
