const { Router } = require('express');

const admin = require('./admin');
const auth = require('./auth');
const board = require('./boards');
const notice = require('./notices');
const search = require('./search');
const intro = require('./intro');
const challenge = require('./challenge');

const router = Router();

router.use('/admin', admin);
router.use('/auth', auth);
router.use('/board', board);
router.use('/notice', notice);
router.use('/search', search);
router.use('/intro', intro);
router.use('/challenge', challenge);

module.exports = router;
