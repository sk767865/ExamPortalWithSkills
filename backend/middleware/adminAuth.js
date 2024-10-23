import jwt from 'jsonwebtoken';

const adminAuth = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ msg: 'Token format is invalid' });
  }

  const actualToken = tokenParts[1];

  try {
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded.user;
    if (decoded.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Not Admin' });
    }
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

export default adminAuth;
