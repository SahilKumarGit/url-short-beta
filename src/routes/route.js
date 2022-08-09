const express = require('express');
const url = require('./../controller/urlsController')
let router = express.Router();

router.post("/url/shorten", url.create)
router.get("/:urlCode", url.redirectUrl)

module.exports = router;