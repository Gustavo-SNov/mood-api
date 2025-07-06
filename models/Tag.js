import { getRow, getAllRows, runQuery } from '../config/database.js';

export class Tag {
  constructor(data) {
    this.id = data.id;
    this.tag_name = data.tag_name;
    this.icon = data.icon;
    this.group_id = data.group_id;
  }

  static async getGroupsWithTags() {
    const groups = await getAllRows('SELECT * FROM group_tag');

    const result = await Promise.all(groups.map(async group => {
      const tags = await getAllRows(
        'SELECT id, tag_name as name, icon FROM tag WHERE group_id = ?',
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

  static async getTagsById(id){
    const tag = await getRow('SELECT * FROM tag WHERE id = ?', id);
    if (!tag) return null;

     return tag;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.tag_name,
      icon: this.icon,
      group_id: this.group_id
    };
  }
}
