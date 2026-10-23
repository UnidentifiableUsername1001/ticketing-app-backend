import mongoose, { sanitizeFilter } from 'mongoose';
import { company } from '../../models/company.js';
import { user } from '../../models/user.js';
import bcrypt, { hash } from "bcryptjs";

const companyRegistration = async (req, res) => {

    let companyData, userData, mappingError;

    const bodyExists = 
        !req.body.userData 
        || !req.body.companyData 
        || Object.keys(req.body.companyData).length === 0
        || Object.keys(req.body.userData).length === 0

    if (bodyExists) return res.status(400).send('Data missing from request');

    let hashed;
    let password = req.body?.userData?.password?.value 

    if(password && password.trim() !== ''){
        hashed = await hash(req.body.userData.password.value, 10);
    }

    if(!hashed) return res.status(400).send('Error securing password, please try again later');

    Object.entries(req.body).map(([outerKey, outerValue]) => {
        if (outerKey === 'companyData') {
            for (const [key, value] of Object.entries(outerValue)) {
                switch(true) {
                    case !value.value:
                        return mappingError = {status: 400, message: `'${key}' was sent without data.`}
                    case typeof value.value === 'string' && value.value.trim() === '':
                        return mappingError = {status: 400, message: `'${key}' was left blank.`}
                    case typeof value.value === 'number' && value.value <= 0:
                        return mappingError = {status: 400, message: `'${key}' cannot be less than or equal to 0`}
                    default:
                        companyData = {
                            ...companyData,
                            [key]: value.value
                        }
                }
                if(mappingError) {
                    return;
                }
            }
            if(mappingError) {
                return;
            }
        }
        if (outerKey === 'userData') {
            for (const [key, value] of Object.entries(outerValue)) {
                switch(true) {
                    case !value.value:
                        return mappingError = {status: 400, message: `'${key}' was sent without data.`}
                    case typeof value.value === 'string' && value.value.trim() === '':
                        return mappingError = {status: 400, message: `'${key}' was left blank.`}
                    case typeof value.value === 'number' && value.value <= 0:
                        return mappingError = {status: 400, message: `'${key}' cannot be less than or equal to 0`}
                    case key === 'email':
                        // Will add this later, but intended to 
                        // run email validation function and return error res if not passed
                    default:
                        if (key !== 'password') {
                            userData = {
                                ...userData,
                                [key]: value.value
                            }
                        } else {
                            userData = {
                                ...userData,
                                [key]: hashed
                            };
                        }
                }
                if(mappingError) {
                    return;
                }
            }

            if(mappingError) {
                return;
            }
        }
    });

    if(mappingError) {
        return res.status(mappingError.status).send(mappingError.message);
    }

    userData = {
        ...userData,
        passwordResetRequired: false,
        role: 'Admin'
    }
    
    const session = await mongoose.startSession();

    try {
        
        const transactionResult = await session.withTransaction(async () => {

            let filter = {companyName: companyData.companyName};
            sanitizeFilter(filter);

            const existingCompany = await company.findOne(filter).session(session).setOptions({skipTenant: true});
                if (existingCompany) {
                    return {
                        status: 409,
                        message: 'Company Already Registered'
                    }
                }

            const newCompany = new company(companyData);
            const savedCompany = await newCompany.save({session: session, skipTenant: true});
            
            userData = {
                ...userData,
                companyId: savedCompany._id,
            }

            const newUser = new user(userData);
            await newUser.save({session: session, skipTenant: true});

            return {
                status: 201,
                message: 'Company and First User Registered!'
            }
        })

    return res.status(transactionResult.status).send(transactionResult.message);

    } catch (e) {
        console.log(e);
        return res.status(500).send({message: 'Internal server error', error: e});
    } finally {
        await session.endSession();
    }
};

export {
    companyRegistration
}