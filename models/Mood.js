import { runQuery, getRow, getAllRows } from '../config/database.js';
import { Tag } from './Tag.js'

export class Mood {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.rating = data.rating;
    this.note = data.note;
    this.date = data.date;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.tags = data.tags || [];
  }

  static async create(moodData) {
    const { userId, rating, note, date, tags = [] } = moodData;

    const result = await runQuery(
      "INSERT INTO moods (user_id, rating, note, date) VALUES (?, ?, ?, ?)",
      [userId, rating, note, date],
    );

    const moodId = result.id;

    for (const tagId of tags) {
      await runQuery("INSERT INTO mood_tag (mood_id, tag_id) VALUES (?, ?)", [
        moodId,
        tagId,
      ]);
    }

    return await Mood.findById(moodId);
  }

  static async findById(id) {
    const mood = await getRow("SELECT * FROM moods WHERE id = ?", [id]);
    if (!mood) return null;

    const tags = await Tag.getTagsForMood(id);
    return new Mood({ ...mood, tags });
  }

  static async findByUserId(userId) {
    let query = "SELECT * FROM moods WHERE user_id = ?";
    let params = [userId];
    query += " ORDER BY date DESC";

    const moods = await getAllRows(query, params);

    const moodsWithTags = await Promise.all(
      moods.map(async (mood) => {
        const tags = await Tag.getTagsForMood(mood.id);
        return new Mood({ ...mood, tags });
      })
    );

    return moodsWithTags;
  }

  static async findByUserIdAndDate(userId, date) {
    const mood = await getRow(
      "SELECT * FROM moods WHERE user_id = ? AND date = ?",
      [userId, date],
    );
    if (!mood) return null;

    const tags = await Tag.getTagsForMood(mood.id);
    return new Mood({ ...mood, tags });
  }

 async update(updates) {
    const allowedUpdates = ["rating", "note", "tags"];
    const validUpdates = {};

    for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
            validUpdates[key] = updates[key];
        }
    }

    if (Object.keys(validUpdates).length === 0) {
        return this;
    }

    // Atualiza os campos do mood (rating e note)
    if (validUpdates.rating || validUpdates.note) {
        const moodUpdates = {};
        if (validUpdates.rating) moodUpdates.rating = validUpdates.rating;
        if (validUpdates.note) moodUpdates.note = validUpdates.note;

        const setClause = Object.keys(moodUpdates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values = [...Object.values(moodUpdates), this.id];

        await runQuery(
            `UPDATE moods SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values,
        );
    }

    if (validUpdates.tags !== undefined) {
       
        await runQuery("DELETE FROM mood_tag WHERE mood_id = ?", [this.id]);
        if (Array.isArray(validUpdates.tags) && validUpdates.tags.length > 0) {
            for (const tagId of validUpdates.tags) {
                await runQuery("INSERT INTO mood_tag (mood_id, tag_id) VALUES (?, ?)", [
                    this.id,
                    tagId,
                ]);
            }
        }
    }

    return await Mood.findById(this.id);
}

  async delete() {
    await runQuery("DELETE FROM moods WHERE id = ?", [this.id]);
  }

  static async getAnalytics(userId, timeRange = "30d") {
    const days = parseInt(timeRange.replace("d", "")) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const moods = await getAllRows(
      'SELECT rating, date FROM moods WHERE user_id = ? AND date >= ? ORDER BY date ASC',
      [userId, startDateStr]
    );

    const analytics = {
      totalEntries: moods.length,
      averageMood: 0,
      moodDistribution: {},
      bestDay: null,
      worstDay: null,
      topTags: [],
      trends: []
    };

    if (moods.length === 0) {
      return analytics;
    }

    const totalMoodValue = moods.reduce((sum, mood) => sum + mood.rating, 0);
    analytics.averageMood = Math.round(totalMoodValue / moods.length);

    moods.forEach((mood) => {
      analytics.moodDistribution[mood.rating] =
        (analytics.moodDistribution[mood.rating] || 0) + 1;
    });

    let bestMood = 0;
    let worstMood = 11;

    moods.forEach((mood) => {
      if (mood.rating > bestMood) {
        bestMood = mood.rating;
        analytics.bestDay = mood.date;
      }
      if (mood.rating < worstMood) {
        worstMood = mood.rating;
        analytics.worstDay = mood.date;
      }
    });

    analytics.topTags = await Tag.getTopTagsForUser(userId, timeRange, 5);
    analytics.trends = await this.getTrends(userId, timeRange);

    return analytics;
  }

  static async getTrends(userId, timeRange = '30d') {
    const days = parseInt(timeRange.replace('d', '')) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const formattedDate = startDate.toISOString().split('T')[0];

    const query = `
      SELECT 
        date,
        AVG(rating) AS avg_mood,
        COUNT(*) AS entries
      FROM moods
      WHERE user_id = ? AND date >= ?
      GROUP BY date
      ORDER BY date ASC
    `;

    const trends = await getAllRows(query, [userId, formattedDate]);

    return trends.map(trend => ({
      date: trend.date,
      averageMood: Math.round(trend.avg_mood * 100) / 100,
      entries: trend.entries
    }));
  }

  toJSON() {
    return {
      id: this.id,
      rating: this.rating,
      note: this.note,
      date: this.date,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
    };
  }
}
