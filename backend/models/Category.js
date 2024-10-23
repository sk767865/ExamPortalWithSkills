// models/Category.js

import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  skills: [
    
    { 
      
        skillName:{type:String,required:true},
        isSkillDeleted:{type :Boolean ,default:false},
        courseDuration:{type: String, required:true}
    
    }

  ],

  isCategoryDeleted: { type: Boolean, default: false }  

});


const processString = (str) => {
  return str
    .trim() 
    .replace(/\s+/g, ' ') 
    .split(' ') 
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' '); 
};

CategorySchema.statics.editCategoryName = async function (categoryName, newCategoryName) {
  const processedCategoryName = processString(categoryName);
  const processedNewCategoryName = processString(newCategoryName);

  console.log('Processed current category name:', processedCategoryName);
  console.log('Processed new category name:', processedNewCategoryName);

  // Find the category by the current name
  const category = await this.findOne({ name: processedCategoryName });

  // If category is not found, throw an error
  if (!category) {
    console.error('Category not found:', processedCategoryName);
    throw new Error('Category not found');
  }

  // Check if a category with the new name already exists
  const existingCategory = await this.findOne({ name: processedNewCategoryName });
  if (existingCategory) {
    console.error('Category with new name already exists:', processedNewCategoryName);
    throw new Error('A category with the new name already exists');
  }

  // Update the category's name
  category.name = processedNewCategoryName;

  // Save the updated category
  return category.save();
};


CategorySchema.statics.addSkillToCategory = async function (categoryName, skill,courseDuration) {
  const processedCategoryName = processString(categoryName);
  const processedSkill = processString(skill);

  let category = await this.findOne({ name: processedCategoryName });

  if (!category) {
    category = new this({
      name: processedCategoryName,
      skills: [{ skillName: processedSkill, isSkillDeleted: false ,courseDuration: courseDuration}],
      isCategoryDeleted: false
    });
  } else {
    const skillIndex = category.skills.findIndex(
      (s) => s.skillName === processedSkill
    );

    if (skillIndex === -1) {
      category.skills.push({ skillName: processedSkill, isSkillDeleted: false ,courseDuration: courseDuration });
    } else {
      throw new Error('Skill already exists in this category');
    }
  }

  return category.save();
};



// Method to toggle skill's isSkillDeleted value
CategorySchema.statics.toggleSkillDeleted = async function (categoryName, skill) {
  const processedCategoryName = processString(categoryName);
  const processedSkill = processString(skill);

  const category = await this.findOne({ name: processedCategoryName });

  if (!category) {
    throw new Error('Category not found');
  }

  const skillIndex = category.skills.findIndex(
    (s) => s.skillName === processedSkill
  );

  if (skillIndex !== -1) {
    category.skills[skillIndex].isSkillDeleted = !category.skills[skillIndex].isSkillDeleted;
  } else {
    throw new Error('Skill not found in this category');
  }

  return category.save();
};



// Assuming processString is defined elsewhere to format strings
CategorySchema.statics.toggleCategoryDeleted = async function (categoryName) {
  const processedCategoryName = processString(categoryName);

  console.log('Processed category name:', processedCategoryName);

  const category = await this.findOne({ name: processedCategoryName });

  if (!category) {
    console.error('Category not found:', processedCategoryName);
    throw new Error('Category not found');
  }

  // Toggle the category's `isCategoryDeleted` status
  category.isCategoryDeleted = !category.isCategoryDeleted;

  // If the category is deleted, set all skills to `isSkillDeleted = true`
  if (category.isCategoryDeleted) {
    category.skills.forEach(skill => {
      skill.isSkillDeleted = true;
    });
  }

  return category.save();
};


const Category = mongoose.model('Category', CategorySchema);

export default Category;









