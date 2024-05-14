const Score = require('../models/score');
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const dayjs = require("dayjs");
const duration = require('dayjs/plugin/duration')
dayjs.extend(duration);

const positions = [
  { "x": [61, 63], "y": [36, 41] },
  { "x": [26, 28], "y": [33.5, 38.5] },
  { "x": [10, 11.3], "y": [34, 39] }
];

exports.start = asyncHandler(async (req, res, next) => {
  const score = new Score({
    username: "",
    score: "",
    starttime: new Date(),
    endtime: "",
  });

  // send back the JWT
  jwt.sign({ score }, process.env.SECRET, {}, (err, token) => {
    res.cookie("token", JSON.stringify({ token }), {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: "none",
      // expires: expirationDate,
    });

    res.json({ token });
  });
});

exports.find = asyncHandler(async (req, res, next) => {
  if (!req.body.charId || !req.body.coord) {
    res.sendStatus(400);
  } else {
    const { charId, coord } = req.body;
    let result = false;

    if (charId > -1 && charId < positions.length) {
      // Check if the coord received are between the know values
      // for both x and y of the selected character
      const charPosition = positions[charId];
      result = (coord.x > charPosition.x[0] && coord.x < charPosition.x[1] &&
        coord.y > charPosition.y[0] && coord.y < charPosition.y[1])
    }

    res.json({ result })
  }
});

exports.end = asyncHandler(async (req, res, next) => {
  if (!req.score) {
    res.sendStatus(400);
  } else {
    const start = dayjs(req.score.starttime);
    const end = dayjs(new Date());
    const duration = dayjs.duration(end.diff(start)).format('HH:mm:ss');

    const score = new Score({
      username: "",
      score: duration,
      starttime: start,
      endtime: end,
    });

    // send back the JWT
    jwt.sign({ score }, process.env.SECRET, {}, (err, token) => {
      res.cookie("token", JSON.stringify({ token }), {
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        sameSite: "none",
        // expires: expirationDate,
      });

      res.json({ token });
    });
  }
});

exports.save = asyncHandler(async (req, res, next) => {
  if (!req.score || !req.body.username) {
    res.sendStatus(400);
  } else {
    const score = new Score({
      ...req.score,
      username: req.body.username
    });

    await score.save();

    // send back the JWT
    const expirationDate = dayjs().add(2, "seconds").toDate(); // if updated, the 'expiresIn' value below must be updated
    jwt.sign({ score }, process.env.SECRET, { expiresIn: "2s" }, (err, token) => {
      res.cookie("token", JSON.stringify({ token }), {
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        sameSite: "none",
        expires: expirationDate,
      });

      res.json({ token });
    });
  }
});

exports.leaderboard = asyncHandler(async (req, res, next) => {
  const leaderboard = await Score.find({}, "username score").sort({ 'score': 1 }).limit(10).exec();
  if (!leaderboard) {
    res.sendStatus(404);
  } else {
    res.json({ leaderboard });
  }
});