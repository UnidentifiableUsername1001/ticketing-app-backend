import { user } from '../../models/user.js';
import { ticket } from '../../models/ticket.js';
import mongoose from 'mongoose';

// <------ NOTES ------> 
// recipientFunctions(intiator, ticket, comment)
// initiator needs a standardised input from the consumer. Let's make it an object that accepts props 'email' & 'mongoId'
// ^^ if (email AND string not empty string) return initiator.email 
// ^^ else {user.findOne(_id: initiator.mongoId)}
// ^^ return an array to maintain consistency across  

const notifyStrategy = {
    "ticketCreated": {
        async sortRecipients({email, mongoId}) {
            if(email && email.trim() !== '') {
                return email
            } else {
                const userEmail = await user.findById(mongoId).select('email -_id');
                return [userEmail.email];
             }    
        },
        buildContent(ticket) {
            return {
                subject: `Request: ${ticket.title}`,
                text: `Just confirming that we received your request. Updates are on the way!`,
                html: 
                    `
                        <p>Just confirming that we received your request. Updates are on the way!</p><br>
                        <a href="https://wisetickets/ticket/${ticket._id}">View request</a>
                    `
            }
        }
    },
    "ticketStatusUpdated": {
        async sortRecipients({email, mongoId}, ticket) {
            let userIds;
            if(mongoId) {
                const initiatorId = new mongoose.Types.ObjectId(mongoId);
                userIds = ticket.followers.filter((follower) => follower !== initiatorId);
            } else {
                userIds = [...ticket.followers];
            }
            
            const query = { _id: { $in: userIds } };
            const emails = await user.distinct('email', query);

            if(email && email.trim() !== '') {
                return emails.filter((item) => item !== email)
            } else {
                return emails
            }
        },
        buildContent({email, mongoId}, ticket){
            
            let query;

            if(email) {
                query = { email: email };
            } else {
                query = { _id: mongoId }
            };

            const updator = user.findOne(query).select('firstName lastName');
            return {
                subject: `${ticket.title}`,
                text: `${updator.firstName} ${updator.lastName} updated the status to ${ticket.status}`,
                html: `
                    <p>${updator.firstName} ${updator.lastName} updated the status to ${ticket.status}</p><br>
                    <a href="https://wisetickets/ticket/${ticket._id}">View request</a>
                `
            }
            
        }
    },
    "ticketAssigneeUpdated": {
        async sortRecipients({email, mongoId}, ticket) {
            let userIds;
            if(mongoId) {
                const initiatorId = new mongoose.Types.ObjectId(mongoId);
                userIds = ticket.followers.filter((follower) => follower !== initiatorId);
            } else {
                userIds = [...ticket.followers];
            }
            
            const query = { _id: { $in: userIds } };
            const emails = await user.distinct('email', query);

            if(email && email.trim() !== '') {
                return emails.filter((item) => item !== email)
            } else {
                return emails
            }
        },
        buildContent({email, mongoId}, ticket){
            
            let query;

            if(email) {
                query = { email: email };
            } else {
                query = { _id: mongoId }
            };
            
            const updator = user.findOne(query).select('firstName lastName');

            return {
                subject: `${ticket.title}`,
                text: `${updator.firstName} ${updator.lastName} updated the assignee to ${ticket.assignedTo}`,
                html: `
                    <p>${updator.firstName} ${updator.lastName} updated the status to ${ticket.assignedTo}</p><br>
                    <a href="https://wisetickets/ticket/${ticket._id}">View request</a>
                `
            }
            
        }
    }
    "commentAddedNoTag": {
        async sortRecipients({email, mongoId}, ticket, comment) {

        },
        buildContent(ticket){
            
        }
    },
    "commentAddedTagged": {
        async sortRecipients({email, mongoId}, ticket, comment) {

        },
        buildContent(ticket){
            
        }
    }
}