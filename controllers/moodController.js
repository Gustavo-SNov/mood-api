import { Mood } from "../models/Mood.js";
import { validationResult } from "express-validator";

// Get all moods for user
export const getMoods = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const moods = await Mood.findByUserId(userId);

    res.json(moods.map((mood) => mood.toJSON()));
  } catch (error) {
    next(error);
  }
};

// Get single mood
export const getMood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mood = await Mood.findById(id);

    if (!mood) {
      return res.status(404).json({
        message: "Entrada de humor não encontrada",
      });
    }

    // Check if mood belongs to user
    if (mood.userId !== userId) {
      return res.status(403).json({
        message: "Acesso negado",
      });
    }

    res.json(mood.toJSON());
  } catch (error) {
    next(error);
  }
};

export const createMood = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Falha na validação",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { rating, note, date, tags } = req.body;
    const moodDate = date || new Date().toISOString().split("T")[0];
    const moodData = {
      userId,
      rating,
      note,
      date: moodDate,
      tags: Array.isArray(tags) ? tags : [],
    };

    await Mood.create(moodData);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

// Update mood entry
export const updateMood = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "A validação falhou",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const mood = await Mood.findById(id);

    if (!mood) {
      return res.status(404).json({
        message: "Entrada de humor não encontrada",
      });
    }

    // Check if mood belongs to user
    if (mood.userId !== userId) {
      return res.status(403).json({
        message: "Acesso negado",
      });
    }

    await mood.update(req.body);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

// Delete mood entry
export const deleteMood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mood = await Mood.findById(id);

    if (!mood) {
      return res.status(404).json({
        message: "Entrada de humor não encontrada",
      });
    }

    // Check if mood belongs to user
    if (mood.userId !== userId) {
      return res.status(403).json({
        message: "Acesso negado",
      });
    }

    await mood.delete();
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { range = "30d" } = req.query;

    const analytics = await Mood.getAnalytics(userId, range);

    res.json(
      analytics,
    );
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { range = '30d' } = req.query;

    const trends = await Mood.getTrends(userId, range);

    res.json(
        trends
    );
  } catch (error) {
    next(error);
  }
};