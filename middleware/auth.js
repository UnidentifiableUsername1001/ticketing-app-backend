import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { tenantStorage } from '../context/tenantStorage.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


const requireAuthStandard = (req, res, next) => {
    const token = req.header('Authorization');
    if (token == undefined || !token.includes('Bearer')) return res.status(401).json({message: 'Token undefined or invalid'});
    
    const array = token.split('Bearer '); 
    const splitToken = array[1];

    try {
        const decoded = jwt.verify(splitToken, JWT_SECRET);

        if (decoded.user.scope == 'password_reset_only') {
            return res.status(401).json({message: 'Token type allows password reset only'});
        }

        req.user = decoded.user;

        let companyId = decoded.user.companyId;
        
        tenantStorage.run(companyId, () => {
            next();
        });

    } catch (err) {
        console.log(err);
       return res.status(401).json({error: err, message: 'Error validating'});
    }
};

const reqAuthPassReset = (req, res, next) => {
    
    const token = req.header('Authorization');
    if (token == undefined || !token.includes('Bearer')){ 
        
        return res.status(401).json({message: 'Token undefined or invalid'});
    }
    const array = token.split('Bearer '); 
    const splitToken = array[1];

    try {
        
        const decoded = jwt.verify(splitToken, JWT_SECRET);
        

        if (decoded.user.scope !== 'password_reset_only'){
            return res.status(401).json({message: 'Incorrect token type for this operation'});
        }

        req.user = decoded.user;

        let companyId = decoded.user.companyId;

        tenantStorage.run(companyId, () => {
            next();
        });

    } catch (err) {
        console.log(err);
        return res.status(401).json({error: err, message: 'Error validating'});
    }
}

export {
    requireAuthStandard,
    reqAuthPassReset
};
