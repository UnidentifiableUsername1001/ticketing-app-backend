import { user } from '../../models/user.js';
import { ticket } from '../../models/ticket.js';
import mongoose from 'mongoose';
import { comments } from '../../models/comments.js';

// <------ NOTES ------> 
// recipientFunctions(intiator, ticket, comment)
// initiator needs a standardised input from the consumer. Let's make it an object that accepts props 'email' & 'mongoId'
// ^^ if (email AND string not empty string) return initiator.email 
// ^^ else {user.findOne(_id: initiator.mongoId)}
// ^^ return an array to maintain consistency across  

async function filterInitiator({email, mongoId}, ticket) {
    let userIds;
    if(mongoId) {
        const initiatorId = mongoId.toString();
        userIds = ticket.followers.filter((follower) => follower.toString() !== initiatorId);
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
}

const notifyStrategy = {
    "ticketCreated": {
        async sortRecipients({email, mongoId}) {
            if(email && email.trim() !== '') {
                return [email]
            } else {
                const userEmail = await user.findById(mongoId).select('email -_id');
                return [userEmail.email];
             }    
        },
        buildContent(ticket) {
            return {
                subject: `${ticket.ticketNumber}: ${ticket.title}`,
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
        filterInitiator,
        buildContent({firstName, lastName, ticket}){
            return {
                subject: `${ticket.ticketNumber}: ${ticket.title}`,
                text: `${firstName} ${lastName} updated the status to ${ticket.status}`,
                html: `
                    <p>${firstName} ${lastName} updated the status to ${ticket.status}</p><br>
                    <a href="https://wisetickets/ticket/${ticket._id}">View request</a>
                `
            }
            
        }
    },
    "ticketAssigneeUpdated": {
        filterInitiator,
        buildContent({firstName, lastName, ticket}){
            return {
                subject: `${ticket.ticketNumber}: ${ticket.title}`,
                text: `${firstName} ${lastName} updated the assignee to ${ticket.assignedTo}`,
                html: `
                    <p>${firstName} ${lastName} updated the status to ${ticket.assignedTo}</p><br>
                    <a href="https://wisetickets/ticket/${ticket._id}">View request</a>
                `
            }
            
        }
    },
    "commentAddedNoTag": {
        filterInitiator,
        buildContent({firstName, lastName, ticket, comment}){
            return {
                subject: `${ticket.ticketNumber}: ${ticket.title}`,
                text: `${firstName} ${lastName} commented: ${comment.bodyText}`,
                html: `
                    <p>${firstName} ${lastName} commented:</p><br>
                    <hr/>
                    <p>${comment.bodyText}</p>
                    <a href="https://wisetickets/ticket/${ticket._id}">View request</a>
                `
            }
        }
    },
    "commentAddedTagged": {
        async sortRecipients({email, mongoId, ticket, comment}) {
            const recipients = comment.mentions.map((person) => person.toString());
            const query = { _id: { $in: recipients } };
            const emails = await user.distinct('email', query);
            return emails;
        },
        buildContent({firstName, lastName, ticket, comment}){
            return {
                subject: `${ticket.ticketNumber}: ${ticket.title}`,
                text: `${firstName} ${lastName} mentioned you: ${comment.bodyText}`,
                html: `
                    <p>${firstName} ${lastName} mentioned you:</p><br>
                    <hr/>
                    <p>${comment.bodyText}</p>
                    <a href="https://wisetickets/ticket/${ticket._id}">View request</a>
                `
            }
        }
    }
}