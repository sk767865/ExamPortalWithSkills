import ExperienceGenusMapping from "../models/ExperienceGenusMapping.js"
import Master from '../models/Master.js'; // Import Master model



export const getAllExperienceGenusMappings = async (req, res) => {
  try {
    const mappings = await ExperienceGenusMapping.find();
    res.status(200).json(mappings);
  } catch (error) {
    console.error('Error fetching Experience-Genus Mappings:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


export const addExperienceGenusMapping = async (req, res) => {
  try {
    const { genus, experienceRange } = req.body;

    if (!genus || !experienceRange) {
      return res.status(400).json({ msg: 'Genus and Experience Range are required' });
    }

    const existingMapping = await ExperienceGenusMapping.findOne({ genus, experienceRange });

    if (existingMapping) {
      return res.status(400).json({ msg: 'Mapping with this Genus and Experience Range already exists' });
    }

    const newMapping = new ExperienceGenusMapping({
      genus,
      experienceRange
    });

    await newMapping.save();
    res.status(201).json(newMapping);
  } catch (error) {
    console.error('Error adding Experience-Genus Mapping:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


export const editGenus = async (req, res) => {
  try {
    const { id, genus, experienceRange } = req.body;

    // Ensure that id and genus are provided
    if (!id || !genus || !experienceRange) {
      return res.status(400).json({ msg: 'ID, Genus, and Experience Range are required' });
    }

    // Find the ExperienceGenusMapping document by ID
    const existingMapping = await ExperienceGenusMapping.findById(id);

    // If the document is not found, return a 404 error
    if (!existingMapping) {
      return res.status(404).json({ msg: 'Experience-Genus mapping not found' });
    }

    const oldGenus = existingMapping.genus;

    // Update the ExperienceGenusMapping document with the new genus and experience range
    const updatedMapping = await ExperienceGenusMapping.findByIdAndUpdate(
      id,
      { genus, experienceRange }, // Update both genus and experience range
      { new: true } // Return the updated document
    );

    // Update the Master data if the genus has changed
    if (genus !== oldGenus) {
      const updatedMaster = await Master.updateMany(
        { genus: oldGenus },  // Match the old genus in Master
        { genus }  // Update it to the new genus
      );

      if (updatedMaster.modifiedCount > 0) {
        // Genus updated in both Experience-Genus mapping and Master data
        return res.status(200).json({ updatedMapping, msg: 'Genus and Experience Range updated, including master data.' });
      } else {
        // Genus updated in Experience-Genus mapping but not found in Master data
        return res.status(200).json({ updatedMapping, msg: 'Genus and Experience Range updated but not present in master data.' });
      }
    } else {
      // If genus didn't change, only return the updated mapping
      return res.status(200).json({ updatedMapping, msg: 'Experience Range updated successfully.' });
    }
  } catch (error) {
    console.error('Error editing Genus and Experience Range:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
};

export const editExperience = async (req, res) => {
  try {
    const { id, experienceRange, genus } = req.body;

    // Validate that all required fields are present
    if (!id || !experienceRange || !genus) {
      return res.status(400).json({ msg: 'ID, Genus, and Experience Range are required' });
    }

    // Find the ExperienceGenusMapping document by ID
    const existingMapping = await ExperienceGenusMapping.findById(id);

    // Return 404 error if the mapping is not found
    if (!existingMapping) {
      return res.status(404).json({ msg: 'Experience-Genus mapping not found' });
    }

    const oldGenus = existingMapping.genus;
    const oldExperienceRange = existingMapping.experienceRange;

    // Update both the genus and experience range in ExperienceGenusMapping
    const updatedMapping = await ExperienceGenusMapping.findByIdAndUpdate(
      id,
      { genus, experienceRange }, // Update both genus and experience range
      { new: true } // Return the updated document
    );

    // Check if the genus has changed, and update Master data if needed
    if (genus !== oldGenus) {
      await Master.updateMany(
        { genus: oldGenus }, // Match old genus in the Master
        { genus } // Update to the new genus
      );
    }

    // Update the experience range in the Master data if it exists
    const updatedMaster = await Master.updateMany(
      { genus, experienceRange: oldExperienceRange }, // Match the old experience range for this genus
      { experienceRange } // Update to the new experience range
    );

    // Check if the update affected any records in the Master data
    if (updatedMaster.modifiedCount > 0) {
      return res.status(200).json({
        updatedMapping,
        msg: 'Experience range and genus updated in master data as well.',
      });
    } else {
      return res.status(200).json({
        updatedMapping,
        msg: 'Experience range and genus updated in db but not present in master data.',
      });
    }
  } catch (error) {
    console.error('Error editing Experience and/or Genus:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


export const deleteExperienceGenusMapping = async (req, res) => {
  try {
    const { _id, genus } = req.body;

    if (!_id || !genus) {
      return res.status(400).json({ msg: 'ID and Genus are required for deletion' });
    }

    // Find the ExperienceGenusMapping document
    const mapping = await ExperienceGenusMapping.findById(_id);

    if (!mapping) {
      return res.status(404).json({ msg: 'Mapping not found' });
    }

    // Check if the genus exists in Master data
    const masterData = await Master.findOne({ genus });

    if (masterData) {
      return res.status(400).json({ msg: 'Deletion not allowed as the given genus is present in master data.' });
    }

    // If genus does not exist in Master, proceed with deletion
    await ExperienceGenusMapping.findByIdAndDelete(_id);
    return res.status(200).json({ msg: 'Genus deleted as it is not present in master data.' });
  } catch (error) {
    console.error('Error deleting Experience-Genus Mapping:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


export const addMultipleExperienceGenusMappings = async (req, res) => {
  try {
    const { mappings } = req.body; // Expect an array of { genus, experienceRange }

    if (!Array.isArray(mappings) || mappings.length === 0) {
      return res.status(400).json({ msg: 'An array of mappings is required' });
    }

    const createdMappings = [];
    const errors = [];

    for (const mapping of mappings) {
      const { genus, experienceRange } = mapping;

      // Validate each entry
      if (!genus || !experienceRange) {
        errors.push({ genus, experienceRange, error: 'Genus and Experience Range are required' });
        continue;
      }

      // Check if the mapping already exists
      const existingMapping = await ExperienceGenusMapping.findOne({ genus, experienceRange });

      if (existingMapping) {
        errors.push({ genus, experienceRange, error: 'Mapping with this Genus and Experience Range already exists' });
        continue;
      }

      // Create and save the new mapping
      const newMapping = new ExperienceGenusMapping({ genus, experienceRange });

      try {
        const savedMapping = await newMapping.save();
        createdMappings.push(savedMapping);
      } catch (saveError) {
        errors.push({ genus, experienceRange, error: 'Error saving this mapping' });
      }
    }

    // Send the response with the list of created mappings and any errors
    return res.status(201).json({ createdMappings, errors });
  } catch (error) {
    console.error('Error adding multiple Experience-Genus mappings:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
