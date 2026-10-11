import { company } from '../../models/company.js';
import { user } from '../../models/user.js';
import bcrypt, { hash } from "bcryptjs";

const companyRegistration = async (req, res) => {
    try {

        let companyData, userData;

        Object.entries(form).map(([outerKey, outerValue]) => {
            if (outerKey === 'companyData') {
                for (const [key, value] of Object.entries(outerValue)) {
                    companyData = {
                        ...companyData,
                        [key]: value.value
                    }
                }
            }
            if (outerKey === 'userData') {
                for (const [key, value] of Object.entries(outerValue)) {

                    if (key === 'password') {
                        bcrypt.hash(value.value, 10, (err, hash) => {
                            if (err) {
                                throw new Error({message: 'Error Hashing', error: err});
                            }

                            userData = {
                                ...userData,
                                [key]: hash
                            };

                        })
                    }

                    userData = {
                        ...userData,
                        [key]: value.value
                    }
                }
            }
        });


        const existingCompany = await company.findOne({companyName: companyData.companyName});
            if (existingCompany) return res.status(400).json({message: 'Company already exists'});
        const newCompany = new company(companyData);
        const savedCompany = await newCompany.save();

        if (savedCompany) {
            userData = {
                ...userData,
                companyId: savedCompany._id,
                passwordResetRequired: false,
                role: 'Admin'
            }
        };
        

        const newUser = new user(userData);

        const savedUser = await newUser.save();

        return res.status(200).json({message: 'Company registered', companyDocument: savedCompany, userDocument: savedUser});
    } catch (e) {
        console.log(e);
        return res.status(500).send({message: 'Internal server error', error: e});
    }
};

export {
    companyRegistration
}