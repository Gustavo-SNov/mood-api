import { Tag } from "../models/Tag.js";

// Retorna grupos com suas tags
export const getGroupsWithTags = async (req, res, next) => {
  try {
    const groups = await Tag.getGroupsWithTags();
    res.json(groups);
  } catch (err) {
    next(err);
  }
};
