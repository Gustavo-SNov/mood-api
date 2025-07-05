import { runQuery, getRow, getAllRows } from '../config/database.js';

export class Mood {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.rating = data.rating;
    this.note = data.note;
    this.date = data.date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.tags = data.tags || [];
  }

  static async create(moodData) {
    const { user_id, rating, note, date, tag_ids = [] } = moodData;

    const result = await runQuery(
      'INSERT INTO moods (user_id, rating, note, date) VALUES (?, ?, ?, ?)',
      [user_id, rating, note, date]
    );

    const moodId = result.id;

    // Inserir tags associadas, se houver
    for (const tagId of tag_ids) {
      await runQuery(
        'INSERT INTO mood_tag (mood_id, tag_id) VALUES (?, ?)',
        [moodId, tagId]
      );
    }

    return await Mood.findById(moodId);
  }

  static async findById(id) {
    const mood = await getRow('SELECT * FROM moods WHERE id = ?', [id]);
    if (!mood) return null;

    const tags = await Mood.getTagsForMood(id);
    return new Mood({ ...mood, tags });
  }

  static async findByUserId(userId, options = {}) {
    let query = 'SELECT * FROM moods WHERE user_id = ?';
    let params = [userId];

    if (options.startDate) {
      query += ' AND date >= ?';
      params.push(options.startDate);
    }

    if (options.endDate) {
      query += ' AND date <= ?';
      params.push(options.endDate);
    }

    query += ' ORDER BY date DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const moods = await getAllRows(query, params);

    // Carregar tags para cada mood
    const moodsWithTags = await Promise.all(
      moods.map(async mood => {
        const tags = await Mood.getTagsForMood(mood.id);
        return new Mood({ ...mood, tags });
      })
    );

    return moodsWithTags;
  }

  static async findByUserIdAndDate(userId, date) {
    const mood = await getRow(
      'SELECT * FROM moods WHERE user_id = ? AND date = ?',
      [userId, date]
    );
    if (!mood) return null;

    const tags = await Mood.getTagsForMood(mood.id);
    return new Mood({ ...mood, tags });
  }

  async update(updates) {
    const allowedUpdates = ['rating', 'note'];
    const validUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        validUpdates[key] = updates[key];
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

  static async getTagsForMood(moodId) {
    return await getAllRows(
      `SELECT tag.id, tag.tag_name, tag.group_id 
       FROM tag 
       INNER JOIN mood_tag ON tag.id = mood_tag.tag_id 
       WHERE mood_tag.mood_id = ?`,
      [moodId]
    );
  }

  toJSON() {
    return {
      id: this.id,
      rating: this.rating,
      note: this.note,
      date: this.date,
      created_at: this.created_at,
      updated_at: this.updated_at,
      tags: this.tags
    };
  }

  // Métodos getAnalytics e getTrends permanecem como estão
}

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