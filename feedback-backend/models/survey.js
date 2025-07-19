const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    required: true,
    enum: ['multiple-choice', 'text', 'rating', 'yes-no', 'checkbox', 'textarea', 'likert', 'date']
  },
  options: {
    type: [String],
    // Only required if questionType is 'multiple-choice'
    required: function() {
      return this.questionType === 'multiple-choice';
    }
  }
});

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Will be required once auth is added
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
