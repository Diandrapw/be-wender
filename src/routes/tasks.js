const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const { date } = req.query;

  try {
    const query = { userId: req.userId };
    if (date) query.date = date;

    const tasks = await Task.find(query).sort({ createdAt: 1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { date, task } = req.body;

  if (!date || !task) {
    return res.status(400).json({ message: "Date and task are required" });
  }

  try {
    const newTask = new Task({ userId: req.userId, date, task });
    await newTask.save();
    res.status(201).json(newTask);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/complete", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;