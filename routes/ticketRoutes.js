import express from 'express';
import dotenv from 'dotenv'; dotenv.config();
import { requireAuthStandard } from '../middleware/auth.js';
import { 
    ticketCountForViews, 
    ticketCreate, 
    ticketGetAll, 
    ticketGetById, 
    ticketSearch, 
    getRequestedByUser,
    getComments,
    addTicketComment,
    ticketUpdateMeta,
    followTicket  
} from '../controllers/tickets/ticketController.js';
import { getUploadUrl } from '../controllers/tickets/attachmentController.js';

const router = express.Router();

router.post('/create', requireAuthStandard, ticketCreate);

router.get('/', requireAuthStandard, ticketGetAll);

router.get('/counts', requireAuthStandard, ticketCountForViews);

router.get('/search', requireAuthStandard, ticketSearch);

router.get('/user-requested', requireAuthStandard, getRequestedByUser);

router.get('/presigned-url', requireAuthStandard, getUploadUrl);

router.get('/:id', requireAuthStandard, ticketGetById);

router.get('/:id/get-comments', requireAuthStandard, getComments);

router.put('/:id/update', requireAuthStandard, ticketUpdateMeta);

router.post('/:id/add-comment', requireAuthStandard, addTicketComment);

router.get('/:id/follow', requireAuthStandard, followTicket);

export {
    router
};