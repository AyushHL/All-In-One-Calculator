import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  googleId: {
    type: String,
    default: null
  },
  username: {
    type: String,
    default: null
  },
  picture: {
    type: String,
    default: null
  },
  notepad: { 
    type: String, 
    default: "" 
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('User', UserSchema);
