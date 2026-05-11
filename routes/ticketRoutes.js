const express = require('express');
const router = express.Router();
const jwtValidation = require('../middleware/auth');
const crudCtrl = require('../controllers/tickets/ticketCRUD');

router.post('/create', jwtValidation, crudCtrl.ticketCreate);

router.get('/', jwtValidation, crudCtrl.ticketGetAll);

router.get('/:id', jwtValidation, crudCtrl.ticketGetById);

router.put('/:id', jwtValidation, crudCtrl.ticketUpdate);

module.exports = router;