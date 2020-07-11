const { Router } = require('express');
const { getSearchResult } = require('./search.ctrl');

const router = Router();

router.get('/', getSearchResult);

module.exports = router;
