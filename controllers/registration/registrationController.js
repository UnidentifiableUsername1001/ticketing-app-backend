import { company } from '../../models/company';

const companyRegistration = async (req, res) => {
    try {
        const { 
            companyName, 
            numberOfEmployees, 
            companyAddress 
        } = req.body;

        const existingCompany = await company.findOne({companyName: companyName});

        if (existingCompany) return res.status(400).json({message: 'Company already exists'});

        const newCompany = new company({
            companyName: companyName,
            numberOfEmployees: numberOfEmployees,
            companyAddress: companyAddress
        });

        const savedCompany = await newCompany.save().setOptions({skipTenant: true});

        return res.status(200).json({message: 'Company registered', companyDocument: savedCompany});
    } catch (e) {
        console.log(e);
        return res.status(500).send({message: 'Internal server error', error: e});
    }
};

export {
    companyRegistration
}