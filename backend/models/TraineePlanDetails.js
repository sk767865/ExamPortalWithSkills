import mongoose from 'mongoose';

// Schema for userDetails
const UserDetailsSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  }
});

// Schema for trainingPlanDetails
const TrainingPlanDetailsSchema = new mongoose.Schema({
  experienceRange: {
    type: String,
    required: true
  },
  genus: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  mustHaveSkill: {
    type: String,
    required: true,
    enum: ['Good to Have', 'Must Have']
  },
  courseDuration: {
    type: String,
    required: true
  },
  courseStartDate: {
    type: Date,
    required: true
  },
  courseEndDate: {
    type: Date,
    required: true
  }
});

// Main schema for userDetails and their training plans
const TraineePlanDetailsSchema = new mongoose.Schema({
  userDetails: {
    type: UserDetailsSchema,
    required: true
  },
  trainingPlanDetails: {
    type: [TrainingPlanDetailsSchema], // Array of trainingPlanDetails
    required: true
  }
});

const TraineePlanDetails = mongoose.model('TraineePlanDetails', TraineePlanDetailsSchema);
export default TraineePlanDetails;
