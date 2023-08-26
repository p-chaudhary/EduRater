const express = require('express');
const router = express.Router();
const institutes = require('../controllers/institutes');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateInstitute } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Institute = require('../models/institute');

router.route('/')
    .get(catchAsync(institutes.index))
    .post(isLoggedIn, upload.array('image'), validateInstitute, catchAsync(institutes.createInstitute))


router.get('/new', isLoggedIn, institutes.renderNewForm)

router.route('/:id')
    .get(catchAsync(institutes.showInstitute))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateInstitute, catchAsync(institutes.updateInstitute))
    .delete(isLoggedIn, isAuthor, catchAsync(institutes.deleteInstitute));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(institutes.renderEditForm))



module.exports = router;
