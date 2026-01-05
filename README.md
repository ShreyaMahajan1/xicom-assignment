# MERN Stack User Registration System

A full-stack web application for user registration with document upload functionality.

## 🚀 Features

- **User Registration Form** with comprehensive validation
- **Document Upload** (Images and PDFs) with file type validation
- **Address Management** with "Same as Residential" option
- **Age Verification** (minimum 18 years)
- **Real-time Form Validation** with instant error clearing
- **Responsive Design** with modern UI/UX
- **File Storage** with organized directory structure

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Multer** for file upload handling
- **CORS** for cross-origin requests
- **dotenv** for environment configuration

### Frontend
- **React.js** with modern hooks
- **Tailwind CSS** for styling
- **Material-UI** components
- **Axios** for API communication
- **Yup** for form validation
- **React Toastify** for notifications
- **React Icons** for UI icons

## 📋 Requirements Met

✅ All mandatory fields marked with asterisks  
✅ Minimum age validation (18 years)  
✅ Conditional permanent address validation  
✅ Minimum 2 documents requirement  
✅ File type validation (image/PDF)  
✅ Real-time validation feedback  

## 🚦 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xicom-assignment
   ```

2. **Setup Backend**
   ```bash
   cd "Xicom Back-end"
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd "Xicom Front-end"
   npm install
   cp .env.example .env
   # Edit .env if needed (default should work)
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000


## 🔧 Environment Variables

### Backend (.env)
```env
VITE_XICOM_ASSIGMENT_MONGO_DB="your_mongodb_connection_string"
PORT=5000
```

### Frontend (.env)
```env
VITE_API_XICOM_ASSIGNMENT_API="http://localhost:5000"
```

## 👨‍💻 Development

### Available Scripts

**Backend:**
- `npm start` - Start server with nodemon
- `npm run server` - Alternative start command

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build



---

**Developed with ❤️**