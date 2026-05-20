const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const JWT_SECRET = process.env.JWT_SECRET;
dotenv.config();

const requireAuth = (req, res, next) => {
    const token = req.header('Authorization');
    if (token == undefined || !token.includes('Bearer')) return res.status(401).json({message: 'Token undefined or invalid'});
    
    const array = token.split('Bearer '); 
    const splitToken = array[1];

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

module.exports = requireAuth;
