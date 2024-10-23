import Master from '../models/Master.js';

// GET request to fetch all Master entries
export const getAllMasterEntries = async (req, res) => {
  try {
    const entries = await Master.find().populate('category');
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching Master entries:', error);
    res.status(500).json({ msg: 'Server error' });
  }
  //  const entries



};


// export const 

export const updateMasterSkill = async (req, res) => {
  const { oldSkill, newSkill } = req.body;

  try {
    // Update all records in the Master table where the skill is the old skill
    await Master.updateMany({ skill: oldSkill }, { skill: newSkill });

    res.status(200).json({ msg: 'Skill updated in all records.' });
  } catch (error) {
    console.error('Error updating skills in Master:', error);
    res.status(500).json({ msg: 'Failed to update skills in Master table.' });
  }
};



export const deleteAllMasterData = async (req, res) => {

  try {
    await Master.deleteMany();
    res.status(200).json({ msg: 'All master data deleted successfully. ' });
  } catch (error) {

    console.error('Error  deleting Master data:', error);
    res.status(500).json({ msg: 'falied to delete Master data' });

  }

}

// POST request to add a new Master entry
export const addMasterEntry = async (req, res) => {
  try {
    const { experienceRange, genus, category, skill, importance, flagged } = req.body;

    // Validate required fields
    if (!experienceRange || !genus || !category || !skill || !importance) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Create a new Master entry
    const newEntry = new Master({
      experienceRange,
      genus,
      category,
      skill,
      importance,
      flagged: flagged || false // default to false if not provided
    });

    await newEntry.save();

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error adding Master entry:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};






// POST request to add multiple Master entries
export const addMultipleMasterEntries = async (req, res) => {
  try {
    const masterData = req.body;

    // Validate that the body is an array and contains entries
    if (!Array.isArray(masterData) || masterData.length === 0) {
      return res.status(400).json({ msg: 'No data provided or data is not in array format' });
    }

    // Validate required fields for each entry
    const isValid = masterData.every(entry => entry.experienceRange && entry.genus && entry.category && entry.skill && entry.importance);
    if (!isValid) {
      return res.status(400).json({ msg: 'All fields are required for each entry' });
    }

    // Bulk insert of master data
    const newEntries = await Master.insertMany(masterData);

    res.status(201).json({ msg: 'Master entries added successfully', data: newEntries });
  } catch (error) {
    console.error('Error adding multiple Master entries:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};









// POST request to fetch all entries for a given genus value
export const getMasterEntriesByGenus = async (req, res) => {
  const { genus } = req.body;

  try {
    // Validate that genus is provided
    if (!genus) {
      return res.status(400).json({ msg: 'Genus is required' });
    }

    // Normalize the genus input by adding one space around the hyphen and removing extra spaces
    const normalizedGenus = genus
      .replace(/\s*-\s*/, ' - ')        // Normalize hyphen to have exactly one space around it
      .replace(/\s+/g, ' ')             // Replace multiple spaces with a single space
      .split(' - ')[1].trim();          // Extract the genus after the hyphen (e.g., "QA Manual")

    // Fetch all entries where genus contains the normalized value (e.g., "QA Manual")
    const entries = await Master.find({
      genus: { $regex: normalizedGenus, $options: 'i' }
    }).populate('category');

    // If no entries found
    if (!entries || entries.length === 0) {
      return res.status(404).json({ msg: 'No entries found for the given genus' });
    }

    // Return the matching entries
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching Master entries by genus:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

