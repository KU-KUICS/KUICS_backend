const { Router } = require('express');
const { getSearch, postSearch } = require('./search.ctrl');

const router = Router();

router.get('/:user_id', getSearch);
router.post('/', postSearch);

module.exports = router;
