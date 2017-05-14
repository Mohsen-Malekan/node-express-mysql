'use strict';

var express = require('express');
var controller = require('./picture.controller');
import multer from 'multer';
var upload = multer({dest: 'uploads/'});
var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', upload.single('image'), controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;