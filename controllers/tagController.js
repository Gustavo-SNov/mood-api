import { Tag } from '../models/Tag.js';

// Retorna todas as tags
export const getAllTags = async (req, res, next) => {
  try {
    const tags = await Tag.findAll();
    res.json( tags );
  } catch (err) {
    next(err);
  }
};

// Retorna tag por ID
export const getTagById = async (req, res, next) => {
  try {
    const tag = await Tag.getTagsById(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag não encontrada' });
    res.json( tag );
  } catch (err) {
    next(err);
  }
};

// Retorna grupos com suas tags
export const getGroupsWithTags = async (req, res, next) => {
  try {
    const groups = await Tag.getGroupsWithTags();
    res.json( groups );
  } catch (err) {
    next(err);
  }
};
