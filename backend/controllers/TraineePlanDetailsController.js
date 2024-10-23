import TraineePlanDetails from '../models/TraineePlanDetails.js';

// GET request to fetch all trainee plan details
export const getAllTraineePlanDetails = async (req, res) => {
  try {
    const traineePlans = await TraineePlanDetails.find();
    res.status(200).json(traineePlans);
  } catch (error) {
    console.error('Error fetching trainee plan details:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET request to fetch trainee plan details by ID
export const getTraineePlanDetailsById = async (req, res) => {
  try {
    const traineePlan = await TraineePlanDetails.findById(req.params.id);
    if (!traineePlan) {
      return res.status(404).json({ msg: 'Trainee plan not found' });
    }
    res.status(200).json(traineePlan);
  } catch (error) {
    console.error('Error fetching trainee plan by ID:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST request to create a new trainee plan
export const createTraineePlanDetails = async (req, res) => {
  try {
    const newTraineePlan = new TraineePlanDetails(req.body);
    const savedTraineePlan = await newTraineePlan.save();
    res.status(201).json(savedTraineePlan);
  } catch (error) {
    console.error('Error creating trainee plan:', error);
    res.status(400).json({ msg: 'Bad request' });
  }
};



// DELETE request to delete a trainee plan by ID
export const deleteTraineePlanDetails = async (req, res) => {
  try {
    const deletedTraineePlan = await TraineePlanDetails.findByIdAndDelete(req.params.id);
    if (!deletedTraineePlan) {
      return res.status(404).json({ msg: 'Trainee plan not found' });
    }
    res.status(200).json({ msg: 'Trainee plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting trainee plan:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};





// PUT request to update planning details for a user
export const updatePlanningDetailsForUser = async (req, res) => {
  try {
    // Extract user details and training plan details from the request body
    const { userDetails, trainingPlanDetails } = req.body;

    // Find the trainee plan by user's email
    const traineePlan = await TraineePlanDetails.findOne({ 'userDetails.email': userDetails.email });
    if (!traineePlan) {
      return res.status(404).json({ msg: 'Trainee plan not found for this user' });
    }

    // Verify if the user's firstname and lastname match
    if (traineePlan.userDetails.firstname !== userDetails.firstname || traineePlan.userDetails.lastname !== userDetails.lastname) {
      return res.status(400).json({ msg: 'User details do not match' });
    }

    // Update the training plan details
    traineePlan.trainingPlanDetails = trainingPlanDetails;

    // Save the updated trainee plan details
    const updatedTraineePlan = await traineePlan.save();

    res.status(200).json({ msg: 'Training plan details updated successfully', updatedTraineePlan });
  } catch (error) {
    console.error('Error updating training plan details for user:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
