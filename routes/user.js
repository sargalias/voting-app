const router = require('express').Router();
const ut = utility = require('../utility/utility');
const uc = userController = require('../controllers/users');


router.get('/', ut.isLoggedInMessage('Login to see your polls'), uc.index);

module.exports = router;
