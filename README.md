

# Smart Survey - Survey and Feedback Management System

**SurveyPro** is a role-based web application that allows organizations to create, distribute, and analyze surveys. Built with HTML, CSS, JavaScript (Frontend), Node.js and Express (Backend), and MongoDB (Database), it provides a robust feedback management solution.

---

## 🔐 User Roles

The system supports two roles:

- **Admin**
  - Full access: create, distribute, and analyze surveys
- **User**
  - Can only respond to surveys

---

## 🚀 Features

### ✅ Authentication & Authorization
- User signup and login with role selection (Admin or User)
- Session-based or JWT authentication
- Role-based access control

### 🛠 Admin Capabilities
- Create surveys with multiple question types:
  - Multiple Choice
  - Likert Scale
  - Star Rating
  - Short Text / Paragraph
  - Checkboxes
  - Dropdown
  - Date / Time
- View and manage all created surveys
- Distribute surveys to users (via shareable links or dashboard)
- View collected responses
- Analyze results via charts and tables

### 📝 User Capabilities
- Sign up / log in
- View assigned or public surveys
- Submit responses
- View their past responses

---

## 📊 Survey Analytics
- View individual survey stats:
  - Response count
  - Completion rate
  - Aggregated results (e.g., average Likert scores, common text responses)
- Graphs and visualizations using Chart.js or similar (optional)

---

## 🧱 Tech Stack

| Layer       | Technology             |
|-------------|------------------------|
| Frontend    | HTML, CSS, JavaScript  |
| Backend     | Node.js, Express       |
| Database    | MongoDB (Mongoose ODM) |
| Auth        | Express-session / JWT  |
| Charts (Optional) | Chart.js           |

---

## 🛠️ Project Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ankursingh018/Feedback-and-Survey-Management-System.git


2. **Install Backend Dependencies**
    npm install

   
3. **Configure Environment Variables**
    Create a .env file in the root with the following:

    env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    SESSION_SECRET=your_secret

   
4. **Run the Server**
     npm start

   
5. **Access the App**

   http://localhost:3000

## 📌 Future Enhancements
       Email invitations for surveys

       Admin dashboard with advanced filters

       Export responses to CSV/PDF

       Real-time analytics updates

       Mobile responsive UI

## 🧑‍💻 Contributing:
Contributions are welcome!
Open an issue or submit a pull request.

## 📄 License:
This project is licensed under the MIT License
