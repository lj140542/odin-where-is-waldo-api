let express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken');
const indexController = require('../controllers/indexController');

router.post('/start', indexController.start);

router.post('/find', verifyToken, indexController.find);

router.post('/end', verifyToken, indexController.end);

router.post('/save', verifyToken, indexController.save)

router.get('/leaderboard', indexController.leaderboard)

function verifyToken(req, res, next) {
  const httpOnlyCookie = req.cookies.token;
  const jsonCookie = httpOnlyCookie ? JSON.parse(httpOnlyCookie) : {};

  if (jsonCookie.token) {
    const cookieToken = jsonCookie.token;
    // verify the token
    jwt.verify(cookieToken, process.env.SECRET, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        req.token = cookieToken;
        req.score = authData.score;
      }
    });
    next();
  } else {
    res.sendStatus(403);
  }
};

module.exports = router;
