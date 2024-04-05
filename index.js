const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://davman:eCPnq7QQbcQqk1Kc@freecodecamp0.elw4apq.mongodb.net/?retryWrites=true&w=majority&appName=freeCodeCamp0",
);

const userSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String,
  },
});

const exerciesSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  description: {
    type: String,
  },
  duration: {
    type: Number,
  },
  date: {
    type: String,
  },
});

const UserModel = mongoose.model("User", userSchema);
const ExerciseModel = mongoose.model("Exercise", exerciesSchema);

app.use(cors());
app.use(express.static("public"));

app.post("/api/users", async (req, res) => {
  const { _id, username } = await UserModel.create({
    username: req.body.username,
  });
  res.json({ username, _id });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const exercise = await ExerciseModel.create({
    userId: _id,
    description,
    duration,
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  });
  const { userId, __v, ...rest } = exercise.toJSON();
  const user = await UserModel.findById(_id);
  res.json({ ...rest, _id: user._id, username: user.username });
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { from, to, limit } = req.query;
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const exercises = await ExerciseModel.find({ userId: req.params._id }).limit(
    limit,
  );
  const filterExercises = exercises.filter((e) => {
    if (fromDate) {
      return new Date(e.date > fromDate);
    }
    if (toDate) {
      return new Date(e.date < toDate);
    }
    return true;
  });
  const user = await UserModel.findById(exercises[0].userId);
  const log = filterExercises.map((e) => ({
    duration: e.duration,
    date: e.date,
    description: e.description,
  }));
  const response = {
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log,
  };
  res.json(response);
});

app.get("/api/users", async (req, res) => {
  const users = await UserModel.find();
  res.json(users);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
