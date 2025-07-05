import { getRow, getAllRows, runQuery } from '../config/database.js';

export class Tag {
  constructor(data) {
    this.id = data.id;
    this.tag_name = data.tag_name;
    this.group_id = data.group_id;
  }

  static async getGroupsWithTags() {
    const groups = await getAllRows('SELECT * FROM group_tag');

    const result = await Promise.all(groups.map(async group => {
      const tags = await getAllRows(
        'SELECT id, tag_name FROM tag WHERE group_id = ?',
        [group.id]
      );

      return {
        id: group.id,
        group_name: group.group_name,
        tags
      };
    }));

    return result;
  }

  toJSON() {
    return {
      id: this.id,
      tag_name: this.tag_name,
      group_id: this.group_id
    };
  }
}
