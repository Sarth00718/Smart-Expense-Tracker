import { isValidObjectId } from '../utils/securityUtils.js';

/**
 * Middleware to validate MongoDB ObjectId in route parameters
 * @param {string} paramName - The name of the parameter to validate (default: 'id')
 */
const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!id) {
            return res.status(400).json({ error: `${paramName} parameter is required` });
        }

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: `Invalid ${paramName} format` });
        }

        next();
    };
};

export {  validateObjectId  };
