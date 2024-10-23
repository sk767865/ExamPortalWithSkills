import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();


// Assuming processString is defined locally or imported
const processString = (str) => {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Add a skill to the category
export const addSkill = async (req, res) => {
  try {
    const { categoryName, skill ,courseDuration } = req.body;

    if (!categoryName || !skill || !courseDuration) {
      return res.status(400).json({ msg: 'Category name, skill, and course duration are required' });
    }

    await Category.addSkillToCategory(categoryName, skill, courseDuration);
    const categories = await Category.find({});
    res.json(categories); // The response will now include isCategoryDeleted
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Skill already exists in this category') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
};


// Toggle the skill's deleted status
export const toggleSkillDeleted = async (req, res) => {
  try {
    const { categoryName, skill } = req.body;

    if (!categoryName || !skill) {
      return res.status(400).json({ msg: 'Category name and skill are required' });
    }

    await Category.toggleSkillDeleted(categoryName, skill);
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Skill not found in this category') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
};

// Toggle the category's deleted status
// Toggle the category's deleted status
export const toggleCategoryDeleted = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ msg: 'Category name is required' });
    }

    console.log('Category name received for deletion toggle:', categoryName);

    await Category.toggleCategoryDeleted(categoryName);
    const categories = await Category.find({});
    res.json(categories);  // Return updated categories with new status
  } catch (err) {
    console.error('Error in toggleCategoryDeleted:', err.message);
    if (err.message === 'Category not found') {
      return res.status(404).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
};



export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}); 
        res.json(categories); 
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};
// Edit category name
export const editCategoryName = async (req, res) => {
  try {
    const { categoryName, newCategoryName } = req.body;

    if (!categoryName || !newCategoryName) {
      return res.status(400).json({ msg: 'Both current category name and new category name are required' });
    }

    // Call the static method to update the category name
    await Category.editCategoryName(categoryName, newCategoryName);

    // Fetch updated categories to return
    const categories = await Category.find({});
    res.json(categories);  // Return updated categories with the new name
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Category not found') {
      return res.status(404).json({ msg: err.message });
    } else if (err.message === 'A category with the new name already exists') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
};

// Edit skill in the category
export const editSkill = async (req, res) => {
  try {
    const { categoryName, oldSkill, newSkill } = req.body;

    if (!categoryName || !oldSkill || !newSkill) {
      return res.status(400).json({ msg: 'Category name, old skill, and new skill are required' });
    }

    // Process input strings
    const processedCategoryName = processString(categoryName);
    const processedOldSkill = processString(oldSkill);
    const processedNewSkill = processString(newSkill);

    // Find the category by name
    const category = await Category.findOne({ name: processedCategoryName });

    // Handle category not found
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Find the skill index
    const skillIndex = category.skills.findIndex(
      (s) => s.skillName === processedOldSkill && !s.isSkillDeleted
    );

    // Handle skill not found or deleted
    if (skillIndex === -1) {
      return res.status(404).json({ msg: 'Skill not found or has been deleted' });
    }

    // Update the skill name
    category.skills[skillIndex].skillName = processedNewSkill;

    await category.save();

    res.json({ msg: 'Skill updated successfully', category });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// Edit course duration in the category
export const editCourseDuration = async (req, res) => {
  try {
    const { categoryName, oldSkill, courseDuration } = req.body;

    if (!categoryName || !oldSkill || !courseDuration) {
      return res.status(400).json({ msg: 'Category name, old skill, and course duration are required' });
    }

    // Process input strings
    const processedCategoryName = processString(categoryName);
    const processedOldSkill = processString(oldSkill);

    // Find the category by name
    const category = await Category.findOne({ name: processedCategoryName });

    // Handle category not found
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Find the skill index
    const skillIndex = category.skills.findIndex(
      (s) => s.skillName === processedOldSkill && !s.isSkillDeleted
    );

    // Handle skill not found or deleted
    if (skillIndex === -1) {
      return res.status(404).json({ msg: 'Skill not found or has been deleted' });
    }

    // Update the course duration
    category.skills[skillIndex].courseDuration = courseDuration;

    // Save the updated category
    await category.save();

    res.json({ msg: 'Course duration updated successfully', category });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// for testing purpose

export const addCategoriesAndSkills = async (req, res) => {
  try {
    const categories = req.body; // Array of categories with skills

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ msg: 'Categories must be provided as an array' });
    }

    // Loop through each category and process strings
    const processedCategories = categories.map(category => ({
      name: processString(category.name),
      skills: category.skills.map(skill => ({
        skillName: processString(skill.skillName),
        isSkillDeleted: skill.isSkillDeleted || false,
        courseDuration: skill.courseDuration || '50'
      })),
      isCategoryDeleted: category.isCategoryDeleted || false
    }));

    // Insert the processed categories into the database
    await Category.insertMany(processedCategories);

    const updatedCategories = await Category.find({});
    res.json(updatedCategories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};




export default router;
