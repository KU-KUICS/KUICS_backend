const { Router } = require('express');

const admin = require('./admin');
const auth = require('./auth');
const board = require('./board');
const notice = require('./notice');
const search = require('./search');

const router = Router();

router.use('/admin', admin);
router.use('/auth', auth);
router.use('/board', board);
router.use('/notice', notice);
router.use('/search', search);

module.exports = router;
