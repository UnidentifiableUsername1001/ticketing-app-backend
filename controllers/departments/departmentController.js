const mongoose = require('mongoose');
const ticket = require('../../models/ticket');
const user = require('../../models/user');
const department = require('../../models/department');

const createDepartment = async (req, res) => {
    try {
        let { name, ticketTypes, config } = req.body;
        
        if (Array.isArray(ticketTypes) && ticketTypes.length !== 0) {
            const sanitisedTicketTypes = ticketTypes.map(ticketType => {
                const rawFields = Array.isArray(ticketType.fields) ? ticketType.fields : [];
                const sanitisedFields = rawFields.map(field => ({
                    name: field.name,
                    expectedType: field.expectedType,
                    dataSource: field.dataSource,
                    required: field.required
                }));

                return {
                    typeName: ticketType.typeName,
                    fields: sanitisedFields
                };
            });

            ticketTypes = sanitisedTicketTypes;
        } else {
            ticketTypes = [];
        };

        if (!name) {
            return res.status(400).json({message: "Department name is required"})
        }

        const deptPayload = {
            name: name.trim(),
            ticketTypes: ticketTypes,
            config: config
        };
        const newDepartment = new department(deptPayload);
        await newDepartment.save();

        return res.status(201).json({message: `Department ${newDepartment.name} added to system`, department: newDepartment});
    } catch (e) {
        console.log(e)
        if (e.code === 11000) {
            return res.status(409).json({ message: "A department with this name already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAllDepartments = async (req, res) => {
    try {
        const deptArray = await department.find({}).exec();
        return res.status(200).json({departments: deptArray});
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getDeptById = async (req, res) => {
    try {
        const id = req.params.id;
        const targetDept = await department.findById({_id: id});

        if (!targetDept) return res.status(404).json({message: "Department not found"});

        return res.status(200).json({department: targetDept});
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const editDepartment = async (req, res) => {
    try {

        const { deptUpdateObj } = req.body;
        let query = null;

        if (req.user.role !== 'admin') {
            query = req.user.department;
        } else {
            query = req.params.deptId;
        };

        const targetDept = await department.findById(query);
        if (!targetDept) return res.status(404).json({message: "Department not found"});

       const deptPairsArray = Object.entries(deptUpdateObj);

       const cleanedPairs = deptPairsArray.filter((pair) => {
            const sanitised = typeof pair[1] === 'string' ? pair[1].trim() : pair[1];
            switch(true) {
                case sanitised === undefined:
                case sanitised === null:
                case sanitised === '':
                    return false;

                case Array.isArray(pair[1]) && pair[1].length === 0:
                    return false;

                case typeof pair[1] === 'object' && pair[1] !== null && Object.keys(pair[1]).length === 0:
                    return false;

                default:
                    return true;
            };
       });

       let cleanedUpdateObj = Object.fromEntries(cleanedPairs);

        // sanitisation for ticket types and fields
        if (Array.isArray(cleanedUpdateObj.ticketTypes) && cleanedUpdateObj.ticketTypes.length !== 0) {

            const sanitisedTicketTypes = cleanedUpdateObj.ticketTypes.map(ticketType => {
                const rawFields = Array.isArray(ticketType.fields) ? ticketType.fields : [];
                const sanitisedFields = rawFields.map(field => ({
                    name: field.name,
                    expectedType: field.expectedType,
                    dataSource: field.dataSource,
                    required: field.required
                }));

                return {
                    typeName: ticketType.typeName,
                    fields: sanitisedFields
                };
            });

            cleanedUpdateObj.ticketTypes = sanitisedTicketTypes;
        };

        targetDept.set(cleanedUpdateObj);
        await targetDept.save();

        return res.status(200).json({message: 'Department Updated', department: targetDept})
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteTicketType = async (req, res) => {
    try {
        const id = req.params.deptId;
        const userDept = req.user.department;
        const typeId = req.params.typeId;

        if (userDept !== id && req.user.role !== 'admin') {
            return res.status(403).json({message: "User not permitted to submit this request"});
        }

        const targetDept = await department.findById(id);

        if (!targetDept) return res.status(404).json({message: "Department not found"});
        
        const typeToDelete = targetDept.ticketTypes.id(typeId);

        if (!typeToDelete) {
            return res.status(404).json({ message: "Ticket type template not found" });
        }
        
        typeToDelete.deleteOne();

        await targetDept.save();
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createDepartment,
    editDepartment,
    deleteTicketType,
    getAllDepartments,
    getDeptById
};