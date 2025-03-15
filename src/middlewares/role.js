const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: 'Acceso denegado. No autenticado.' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You do not have administrator permissions.'
      });
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error in permission verification.' });
  }
};

module.exports = { isAdmin };
