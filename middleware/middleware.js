// middleware.js
function checkRole(requiredRole) {
    return (req, res, next) => {
      // Check if the user is authenticated and has the correct role
      if (req.user && req.user.role === requiredRole) {
        return next(); // User has the correct role, proceed
      }
      res.status(403).send('Access denied'); // User does not have permission
    };
  }
  
  module.exports = checkRole;
  