const user = require('../../models/user');
const department = require('../../models/department');
const ticket = require('../../models/ticket');
const mongoose = require('mongoose');

async function ticketAssignment (deptId) {
    try {

        const dept = await department.findOne({_id: deptId});
        const usersInDept = await user.find({departmentId: deptId});

        if (usersInDept.length == 0 || dept == null) return null;

        if (dept.config.assignmentStrategy == 'load balance') {

            const result = await ticket.aggregate([
                {$match: {departmentId: deptId, status: {$ne: 'Closed'} } },
                {$group: { _id: "$assignedTo", activeTicketCount: { $sum: 1 } } },
                { $sort: {activeTicketCount: 1 } },
                { $limit: usersInDept.length}
            ]);

            const mappedResult = result.map(({_id}) => (_id.toString()));

            for (let i = 0; i < usersInDept.length; i++) {
                if (!mappedResult.includes(usersInDept[i]._id.toString())) {
                        return usersInDept[i]._id.toString();
                    };
                }

                return result[0]._id.toString();
            }
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    ticketAssignment
};