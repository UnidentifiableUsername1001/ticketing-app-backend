const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const JWT_SECRET = process.env.JWT_SECRET;
dotenv.config();

const requireAuthStandard = (req, res, next) => {
    const token = req.header('Authorization');
    if (token == undefined || !token.includes('Bearer')) return res.status(401).json({message: 'Token undefined or invalid'});
    
    const array = token.split('Bearer '); 
    const splitToken = array[1];

    console.log(token);
    console.log(splitToken);

    try {
        const decoded = jwt.verify(splitToken, JWT_SECRET);

        if (decoded.user.scope == 'password_reset_only') return res.status(401).json({message: 'Token type allows password reset only'});

        if (decoded) {
            req.user = decoded.user;
            next();
        }
    } catch (err) {
        console.log(err);
       return res.status(401).json({error: err, message: 'Error validating'});
    }
};

const reqAuthPassReset = (req, res, next) => {
    console.log("1 inside middleware")
    const token = req.header('Authorization');
    if (token == undefined || !token.includes('Bearer')){ 
        console.log('failed at token check');
        res.status(401).json({message: 'Token undefined or invalid'});
}
    const array = token.split('Bearer '); 
    const splitToken = array[1];

    try {
        console.log("--> 2. About to verify token:", splitToken);
        const decoded = jwt.verify(splitToken, JWT_SECRET);
        console.log("--> 3. Token verified successfully. Scope is:", decoded.user.scope);

        if (decoded.user.scope !== 'password_reset_only'){
            console.log("--> Failed at Scope Check"); 
            res.status(401).json({message: 'Incorrect token type for this operation'});
}
        if (decoded) {
            req.user = decoded.user;
            console.log("--> 4. Invoking next()");
            next();
        }
    } catch (err) {
        console.log(err);
        return res.status(401).json({error: err, message: 'Error validating'});
    }
}

module.exports = {
    requireAuthStandard,
    reqAuthPassReset
};
