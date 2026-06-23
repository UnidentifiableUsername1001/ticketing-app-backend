const express = require('express');
const router = express.Router();
const jwtValidation = require('../middleware/auth');
const crudCtrl = require('../controllers/tickets/ticketController');
const { getUploadUrl } = require('../controllers/tickets/attachmentController');

router.post('/create', jwtValidation.requireAuthStandard, crudCtrl.ticketCreate);

router.get('/', jwtValidation.requireAuthStandard, crudCtrl.ticketGetAll);

router.get('/', jwtValidation.requireAuthStandard, crudCtrl.getRequestedByUser);

router.get('/:id', jwtValidation.requireAuthStandard, crudCtrl.ticketGetById);

router.get('/:id/comments', jwtValidation.requireAuthStandard, crudCtrl.getComments);

router.put('/:id/update', jwtValidation.requireAuthStandard, crudCtrl.ticketUpdateMeta);

router.post('/:id/comment', jwtValidation.requireAuthStandard, crudCtrl.addTicketComment);

router.get('/:id/follow', jwtValidation.requireAuthStandard, crudCtrl.followTicket);

router.get('/presigned-url', jwtValidation.requireAuthStandard, getUploadUrl);

module.exports = router;