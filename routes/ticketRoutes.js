const express = require('express');
const router = express.Router();
const jwtValidation = require('../middleware/auth');
const crudCtrl = require('../controllers/tickets/ticketCRUD');
const { getUploadUrl } = require('../controllers/tickets/attachmentController');

router.post('/create', jwtValidation, crudCtrl.ticketCreate);

router.get('/', jwtValidation, crudCtrl.ticketGetAll);

router.get('/:id', jwtValidation, crudCtrl.ticketGetById);

router.get('/:id/comments', jwtValidation, crudCtrl.getComments);

router.put('/:id/update', jwtValidation, crudCtrl.ticketUpdateMeta);

router.post('/:id/comment', jwtValidation, crudCtrl.addTicketComment);

router.get('/presigned-url', jwtValidation, getUploadUrl);

module.exports = router;