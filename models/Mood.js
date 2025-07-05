import { runQuery, getRow, getAllRows } from '../config/database.js';

export class Mood {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.rating = data.rating;
    this.emotions = data.emotions ? JSON.parse(data.emotions) : [];
    this.note = data.note;
    this.activities = data.activities ? JSON.parse(data.activities) : [];
    this.date = data.date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(moodData) {
    const { user_id, rating, emotions, note, activities, date } = moodData;
    
    const result = await runQuery(
      'INSERT INTO moods (user_id, rating, emotions, note, activities, date) VALUES (?, ?, ?, ?, ?, ?)',
      [
        user_id,
        rating,
        emotions ? JSON.stringify(emotions) : null,
        note,
        activities ? JSON.stringify(activities) : null,
        date
      ]
    );

    return await Mood.findById(result.id);
  }

  static async findById(id) {
    const mood = await getRow('SELECT * FROM moods WHERE id = ?', [id]);
    return mood ? new Mood(mood) : null;
  }

  static async findByUserId(userId, options = {}) {
    let query = 'SELECT * FROM moods WHERE user_id = ?';
    let params = [userId];

    // Add date filtering
    if (options.startDate) {
      query += ' AND date >= ?';
      params.push(options.startDate);
    }

    if (options.endDate) {
      query += ' AND date <= ?';
      params.push(options.endDate);
    }

    // Add sorting
    query += ' ORDER BY date DESC';

    // Add pagination
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const moods = await getAllRows(query, params);
    return moods.map(mood => new Mood(mood));
  }

  static async findByUserIdAndDate(userId, date) {
    const mood = await getRow(
      'SELECT * FROM moods WHERE user_id = ? AND date = ?',
      [userId, date]
    );
    return mood ? new Mood(mood) : null;
  }

  async update(updates) {
    const allowedUpdates = ['rating', 'emotions', 'note', 'activities'];
    const validUpdates = {};
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        if (key === 'emotions' || key === 'activities') {
          validUpdates[key] = JSON.stringify(updates[key]);
        } else {
          validUpdates[key] = updates[key];
        }
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return this;
    }

    const setClause = Object.keys(validUpdates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(validUpdates), this.id];

    await runQuery(
      `UPDATE moods SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return await Mood.findById(this.id);
  }

  async delete() {
    await runQuery('DELETE FROM moods WHERE id = ?', [this.id]);
  }

  static async getAnalytics(userId, timeRange = '30d') {
    const days = parseInt(timeRange.replace('d', '')) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moods = await getAllRows(
      'SELECT rating, date FROM moods WHERE user_id = ? AND date >= ? ORDER BY date ASC',
      [userId, startDate.toISOString().split('T')[0]]
    );

    const analytics = {
      totalEntries: moods.length,
      averageMood: 0,
      moodDistribution: {},
      moodTrend: [],
      bestDay: null,
      worstDay: null
    };

    if (moods.length === 0) {
      return analytics;
    }

    // Calculate average mood
    const totalMoodValue = moods.reduce((sum, mood) => sum + mood.rating, 0);
    analytics.averageMood = Math.round((totalMoodValue / moods.length) * 100) / 100;

    // Calculate mood distribution
    moods.forEach(mood => {
      analytics.moodDistribution[mood.rating] = (analytics.moodDistribution[mood.rating] || 0) + 1;
    });

    // Find best and worst days
    let bestMood = 0;
    let worstMood = 11;
    
    moods.forEach(mood => {
      if (mood.rating > bestMood) {
        bestMood = mood.rating;
        analytics.bestDay = mood.date;
      }
      if (mood.rating < worstMood) {
        worstMood = mood.rating;
        analytics.worstDay = mood.date;
      }
    });

    // Calculate mood trend (weekly averages)
    const weeklyData = {};
    moods.forEach(mood => {
      const week = getWeekKey(new Date(mood.date));
      if (!weeklyData[week]) {
        weeklyData[week] = { total: 0, count: 0 };
      }
      weeklyData[week].total += mood.rating;
      weeklyData[week].count += 1;
    });

    analytics.moodTrend = Object.entries(weeklyData).map(([week, data]) => ({
      week,
      average: Math.round((data.total / data.count) * 100) / 100
    }));

    return analytics;
  }

  static async getTrends(userId, period = 'week') {
    let query;
    let groupBy;

    switch (period) {
      case 'week':
        query = `
          SELECT 
            date,
            AVG(rating) as avg_mood,
            COUNT(*) as entries
          FROM moods 
          WHERE user_id = ? AND date >= date('now', '-4 weeks')
          GROUP BY date
          ORDER BY date ASC
        `;
        break;
      case 'month':
        query = `
          SELECT 
            strftime('%Y-%m', date) as period,
            AVG(rating) as avg_mood,
            COUNT(*) as entries
          FROM moods 
          WHERE user_id = ? AND date >= date('now', '-6 months')
          GROUP BY strftime('%Y-%m', date)
          ORDER BY period ASC
        `;
        break;
      case 'year':
        query = `
          SELECT 
            strftime('%Y', date) as period,
            AVG(rating) as avg_mood,
            COUNT(*) as entries
          FROM moods 
          WHERE user_id = ?
          GROUP BY strftime('%Y', date)
          ORDER BY period ASC
        `;
        break;
      default:
        throw new Error('Invalid period. Use: week, month, or year');
    }

    const trends = await getAllRows(query, [userId]);
    return trends.map(trend => ({
      ...trend,
      avg_mood: Math.round(trend.avg_mood * 100) / 100
    }));
  }

  toJSON() {
    return {
      id: this.id,
      rating: this.rating,
      emotions: this.emotions,
      note: this.note,
      activities: this.activities,
      date: this.date,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

// Helper function to get week key
function getWeekKey(date) {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}