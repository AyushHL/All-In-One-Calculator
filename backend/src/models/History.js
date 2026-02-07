import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  }, // 'Scientific', 'BMI', 'Age', 'Converter', 'Finance'
  expression: { 
    type: String, 
    required: true 
  },
  result: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('History', HistorySchema);
