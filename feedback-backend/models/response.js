const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  surveyTitle: {
    type: String,
    required: true
  },
  responses: [{
    question: String,
    answer: mongoose.Schema.Types.Mixed, // Can be string, number, or array for multiple choice
    questionType: String
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  respondentInfo: {
    // You can add more fields like email, name, etc. if needed
    ipAddress: String,
    userAgent: String
  }
});

module.exports = mongoose.model('Response', responseSchema);
