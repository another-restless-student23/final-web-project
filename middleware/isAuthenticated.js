const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    res.redirect('/login'); // Redirect to login if token is invalid
  }
}

module.exports = isAuthenticated;
