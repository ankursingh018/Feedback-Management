const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Feedback = require('./models/feedback');
const Survey = require('./models/survey');
const Response = require('./models/response');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/feedback', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30'; // Change this to a strong secret in production

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hash, role });
    res.json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Survey Route
app.post('/api/surveys', authenticateToken, async (req, res) => {
  try {
    const { title, description, questions, status } = req.body;
    
    if (!title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Title and questions are required' });
    }

    const survey = new Survey({
      title,
      description: description || '',
      creator: req.user.id, // Assuming the user ID is available in the token
      questions: questions.map(q => ({
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options || []
      })),
      status: status || 'draft',
      createdAt: new Date()
    });

    const savedSurvey = await survey.save();
    res.status(201).json(savedSurvey);
  } catch (err) {
    console.error('Error saving survey:', err);
    res.status(500).json({ error: 'Failed to save survey', details: err.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { surveyId, answers, userId } = req.body;
    const newFeedback = new Feedback({ surveyId, answers, userId });
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('userId', 'name email');
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new survey
app.post('/api/surveys', async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    // Basic validation
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Survey must have a title and at least one question.' });
    }

    const newSurvey = new Survey({ title, description, questions });
    await newSurvey.save();
    res.status(201).json({ message: 'Survey created successfully', survey: newSurvey });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all surveys
app.get('/api/surveys', async (req, res) => {
  try {
    const surveys = await Survey.find().populate('creator', 'name email');
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to handle sending survey emails
app.post('/api/send-survey-email', (req, res) => {
  const { fromName, fromEmail, subject, message, recipients } = req.body;

  console.log('Received survey email data:');
  console.log({ fromName, fromEmail, subject, message, recipients });

  // In a real application, you would add your email sending logic here (e.g., using Nodemailer)

  res.status(200).json({ message: 'Survey email data received successfully.' });
});

// Submit a survey response
app.post('/api/responses', async (req, res) => {
  try {
    const { surveyId, responses, respondentInfo } = req.body;
    
    // Get survey to validate and get title
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    // Save response
    const response = new Response({
      surveyId,
      surveyTitle: survey.title,
      responses,
      respondentInfo: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        ...respondentInfo
      }
    });
    
    await response.save();
    
    // Increment response count in survey
    survey.responses = (survey.responses || 0) + 1;
    await survey.save();
    
    res.status(201).json({ message: 'Response saved successfully' });
    
  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ error: 'Failed to save response' });
  }
});

// Get analytics for a survey
app.get('/api/analytics/survey/:surveyId', authenticateToken, async (req, res) => {
  try {
    const { surveyId } = req.params;
    
    // Get survey
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    // Get all responses for this survey
    const responses = await Response.find({ surveyId });
    
    // Basic analytics
    const responseCount = responses.length;
    const completionRate = survey.responseGoal > 0 
      ? Math.min(Math.round((responseCount / survey.responseGoal) * 100), 100) 
      : 0;
    
    // Get response distribution per question
    const questionAnalytics = survey.questions.map(question => {
      const questionResponses = responses.map(r => 
        r.responses.find(r => r.question === question.text)
      ).filter(Boolean);
      
      let analysis = {
        question: question.text,
        type: question.type,
        totalResponses: questionResponses.length,
        data: {}
      };
      
      if (question.type === 'multiple-choice' || question.type === 'checkbox') {
        // For multiple choice/checkbox, count each option
        analysis.data = question.options.reduce((acc, option) => {
          const count = questionResponses.filter(r => {
            if (question.type === 'multiple-choice') {
              return r.answer === option;
            } else {
              return Array.isArray(r.answer) && r.answer.includes(option);
            }
          }).length;
          acc[option] = {
            count,
            percentage: responseCount > 0 ? Math.round((count / responseCount) * 100) : 0
          };
          return acc;
        }, {});
      } else if (question.type === 'rating') {
        // For ratings, calculate average
        const ratings = questionResponses
          .map(r => parseInt(r.answer))
          .filter(r => !isNaN(r));
          
        analysis.data = {
          average: ratings.length > 0 
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
            : 0,
          totalResponses: ratings.length
        };
      } else {
        // For text/short-answer, just count responses
        analysis.data = {
          totalResponses: questionResponses.length,
          sampleResponses: questionResponses
            .slice(0, 10) // Limit sample size
            .map(r => r.answer)
        };
      }
      
      return analysis;
    });
    
    // Response over time
    const responsesByDate = responses.reduce((acc, response) => {
      const date = response.submittedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      survey: {
        title: survey.title,
        description: survey.description,
        createdAt: survey.createdAt,
        responseGoal: survey.responseGoal
      },
      summary: {
        totalResponses: responseCount,
        completionRate,
        averageTimeToComplete: 0, // You can calculate this if you track start/end times
        lastResponse: responses.length > 0 
          ? responses[responses.length - 1].submittedAt 
          : null
      },
      responsesOverTime: responsesByDate,
      questionAnalytics
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get list of surveys with response counts
app.get('/api/analytics/surveys', authenticateToken, async (req, res) => {
  try {
    const surveys = await Survey.find({ creator: req.user.id });
    const surveysWithCounts = await Promise.all(
      surveys.map(async survey => {
        const responseCount = await Response.countDocuments({ surveyId: survey._id });
        return {
          id: survey._id,
          title: survey.title,
          responseCount,
          createdAt: survey.createdAt,
          responseGoal: survey.responseGoal
        };
      })
    );
    
    res.json(surveysWithCounts);
  } catch (error) {
    console.error('Error fetching survey list:', error);
    res.status(500).json({ error: 'Failed to fetch survey list' });
  }
});

app.listen(4000, () => console.log('Server started on http://localhost:4000'));