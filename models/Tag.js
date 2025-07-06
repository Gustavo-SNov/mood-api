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
      [moodId]
    );

    return data.map((tag) => new Tag(tag));
  }

  static async getGroupsWithTags() {
    const groups = await getAllRows("SELECT * FROM group_tag");

    const result = await Promise.all(
      groups.map(async (group) => {
        const data = await getAllRows(
          "SELECT id, tag_name FROM tag WHERE group_id = ?",
          [group.id]
        );

        const tags = data.map((tag) => new Tag(tag));

        return {
          id: group.id,
          groupName: group.group_name,
          tags,
        };
      })
    );

    return result;
  }

  static async getTagsById(id){
    const tag = await getRow('SELECT * FROM tag WHERE id = ?', id);
    if (!tag) return null;

     return tag;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      group_id: this.groupId
    };
  }
}
