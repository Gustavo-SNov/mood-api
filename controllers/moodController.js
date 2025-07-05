import { Mood } from '../models/Mood.js';
import { validationResult } from 'express-validator';

// Get all moods for user
export const getMoods = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      startDate, 
      endDate, 
      limit = 50, 
      offset = 0 
    } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (startDate) {
      options.startDate = startDate;
    }

    if (endDate) {
      options.endDate = endDate;
    }

    const moods = await Mood.findByUserId(userId, options);

    res.json({
      success: true,
      data: {
        moods: moods.map(mood => mood.toJSON()),
        pagination: {
          limit: options.limit,
          offset: options.offset,
          total: moods.length
        }
      }
    });
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
        success: false,
        message: 'Mood entry not found'
      });
    }

    // Check if mood belongs to user
    if (mood.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        mood: mood.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new mood entry
export const createMood = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { mood_value, emotions, notes, activities, date } = req.body;

    // Check if mood entry already exists for this date
    const existingMood = await Mood.findByUserIdAndDate(userId, date || new Date().toISOString().split('T')[0]);
    if (existingMood) {
      return res.status(409).json({
        success: false,
        message: 'Mood entry already exists for this date'
      });
    }

    const moodData = {
      user_id: userId,
      mood_value,
      emotions,
      notes,
      activities,
      date: date || new Date().toISOString().split('T')[0]
    };

    const mood = await Mood.create(moodData);

    res.status(201).json({
      success: true,
      message: 'Mood entry created successfully',
      data: {
        mood: mood.toJSON()
      }
    });
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
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const mood = await Mood.findById(id);

    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }

    // Check if mood belongs to user
    if (mood.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedMood = await mood.update(req.body);

    res.json({
      success: true,
      message: 'Mood entry updated successfully',
      data: {
        mood: updatedMood.toJSON()
      }
    });
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
        success: false,
        message: 'Mood entry not found'
      });
    }

    // Check if mood belongs to user
    if (mood.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await mood.delete();

    res.json({
      success: true,
      message: 'Mood entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get mood analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { range = '30d' } = req.query;

    const analytics = await Mood.getAnalytics(userId, range);

    res.json({
      success: true,
      data: {
        analytics
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get mood trends
export const getTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'week' } = req.query;

    const trends = await Mood.getTrends(userId, period);

    res.json({
      success: true,
      data: {
        trends
      }
    });
  } catch (error) {
    next(error);
  }
};