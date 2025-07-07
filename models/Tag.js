import { getAllRows } from "../config/database.js";

export class Tag {
  constructor(data) {
    this.id = data.id;
    this.name = data.tag_name;
    this.icon = data.icon;
    this.groupId = data.group_id;
  }

  static async getTagsForMood(moodId) {
    const data = await getAllRows(
      `SELECT tag.id, tag.tag_name, tag.group_id 
       FROM tag 
       INNER JOIN mood_tag ON tag.id = mood_tag.tag_id 
       WHERE mood_tag.mood_id = ?`,
      [moodId],
    );

    return data.map((tag) => new Tag(tag));
  }

  static async getGroupsWithTags() {
    const groups = await getAllRows("SELECT * FROM group_tag");

    const result = await Promise.all(
      groups.map(async (group) => {
        const data = await getAllRows(
          "SELECT id, tag_name, icon FROM tag WHERE group_id = ?",
          [group.id],
        );

        const tags = data.map((tag) => new Tag(tag));

        return {
          id: group.id,
          groupName: group.group_name,
          tags,
        };
      }),
    );

    return result;
  }

  static async getTopTagsForUser(userId, timeRange = '30d', limit = 3) {
    const days = parseInt(timeRange.replace('d', '')) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const topTags = await getAllRows(
      `
        SELECT tag.id, tag.tag_name as name, tag.icon, COUNT(*) as count
        FROM moods
        JOIN mood_tag ON moods.id = mood_tag.mood_id
        JOIN tag ON tag.id = mood_tag.tag_id
        WHERE moods.user_id = ? AND moods.date >= ?
        GROUP BY tag.id
        ORDER BY count DESC
        LIMIT ?
      `,
      [userId, startDateStr, limit]
    );

    return topTags;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      group_id: this.groupId,
    };
  }
}
