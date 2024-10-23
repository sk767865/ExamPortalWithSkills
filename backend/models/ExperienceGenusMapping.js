import mongoose from 'mongoose';

const ExperienceGenusMappingSchema = new mongoose.Schema({
  genus: { type: String, required: true },
  experienceRange: { type: String, required: true },
  master: { type: mongoose.Schema.Types.ObjectId, ref: 'Master'} 
});

const ExperienceGenusMapping = mongoose.model('ExperienceGenusMapping', ExperienceGenusMappingSchema);

export default ExperienceGenusMapping;
