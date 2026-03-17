/**
 * Validates a MongoDB ObjectId route parameter.
 * @param {string} paramName - defaults to 'id'
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id) {
      return res.status(400).json({ error: `${paramName} parameter is required` });
    }
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: `Invalid ${paramName} format` });
    }
    next();
  };
};

export { validateObjectId };
