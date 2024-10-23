import mongoose from 'mongoose';

const MasterSchema = new mongoose.Schema({
  experienceRange: { type: String, required: true }, 
  genus: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
  skill: { type: String, required: true },
  importance: { type: String, enum: ['Must Have', 'Good to Have'], required: true },
  flagged: { type: Boolean, default: false }
});

// Create and export the model
const Master = mongoose.model('Master', MasterSchema);
export default Master;









