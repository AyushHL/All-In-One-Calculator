# All-in-One Calculator Hub 🧮

A modern, full-featured calculator application built with **MERN Stack** (MongoDB, Express, React, Node.js) + **TypeScript** + **Vite**.

## ✨ Features

### 🧮 Calculators
- **Basic** - Standard arithmetic operations with percentage support
- **Scientific** - Trigonometric, logarithmic, power functions with constants (π, e)
- **Age** - Calculate exact age from DOB with next birthday countdown
- **BMI** - Body Mass Index with metric/imperial units and health categories
- **Unit Converter** - Length, weight, and temperature conversions
- **Number System** - Convert between Binary, Octal, Decimal, Hex, Base32/36

### 👤 User Features
- **Authentication** - Secure registration/login with JWT, Google OAuth 2.0, password reset via email OTP
- **Profile** - Customizable username and profile picture (5MB limit, JPEG/PNG/GIF/WebP)
- **Notepad** - Auto-saving personal notepad with bookmark to Saved Notes
- **Saved Notes** - Full CRUD operations with timestamps and inline editing
- **History** - Automatic tracking of all calculations with filtering and timestamps

### 🎨 UI/UX
- **Design** - Glass-morphism effects, gradient backgrounds, smooth animations (Framer Motion)
- **Responsive** - Mobile-first approach, optimized for all screen sizes
- **Interactive** - Custom notifications, confirmation dialogs, loading states

### 🔒 Security
- JWT token authentication (7-day expiration)
- Password hashing with bcryptjs (10 salt rounds)
- Protected API routes with middleware
- Input validation and CORS configuration

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```powershell
# Clone the repository
git clone https://github.com/AyushHL/All-In-One-Calculator.git
cd All-In-One-Calculator

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create/update `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/calculatorHub
JWT_SECRET=your_secret_key_here

# Email configuration
EMAIL_SERVICE=gmail
EMAIL_USER=calculatorhub.noreply@gmail.com
EMAIL_PASSWORD=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Run Application

```powershell
# Terminal 1: Start backend
cd backend
node src/server.js
# Server runs on http://localhost:5000

# Terminal 2: Start frontend
cd frontend
npm run dev
# App opens at http://localhost:3000
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── models/        # User, History, Note schemas
│   ├── routes/        # API endpoints (auth, history, notes, notepad, support)
│   ├── middleware/    # JWT authentication
│   ├── config/        # Database & Passport configuration
│   ├── utils/         # Email service
│   └── server.js      # Express server
├── uploads/           # Profile pictures
└── .env               # Environment variables

frontend/
├── src/
│   ├── components/    # Calculators, Auth, Profile, Notes, History
│   ├── context/       # Global state management
│   └── App.tsx        # Main component
└── vite.config.ts     # Vite configuration
```

## 🎯 Usage

1. **Sign Up/Login** - Click user icon (👤) in top-right
2. **Select Calculator** - Open sidebar (☰) and choose from menu
3. **View History** - All calculations auto-save when logged in
4. **Use Notepad** - Auto-saves every 2s, bookmark important notes
5. **Manage Notes** - Full CRUD in Saved Notes section

### Calculator Tips
- **Scientific**: Supports expressions like `sin(45) * 2 + 3`
- **BMI**: Color-coded categories (Blue: Underweight, Green: Normal, Yellow: Overweight, Red: Obese)
- **Age**: Shows exact age, total days lived, and next birthday countdown
- **Unit Converter**: Use swap button (🔄) to reverse conversion
- **Number System**: Validates input for each base with examples

## 🛠️ Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Math.js, Axios  
**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Nodemailer, Passport.js, Multer

## 📝 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user  
- `POST /google` - Google OAuth login
- `POST /forgot-password` - Request password reset OTP
- `POST /reset-password` - Reset password with OTP
- `GET /user` - Get current user (protected)
- `PUT /user/username` - Update username (protected)
- `POST /user/profile-picture` - Upload profile picture (protected)

### History (`/api/history`)
- `GET /` - Get all calculations (protected)
- `POST /` - Add calculation (protected)
- `DELETE /:id` - Delete calculation (protected)
- `DELETE /` - Clear all history (protected)

### Notepad (`/api/notepad`)
- `GET /` - Get notepad content (protected)
- `POST /` - Update notepad (protected)

### Notes (`/api/notes`)
- `GET /` - Get all notes (protected)
- `POST /` - Create note (protected)
- `PUT /:id` - Update note (protected)
- `DELETE /:id` - Delete note (protected)

### Support (`/api/support`)
- `POST /send` - Send support email

**Auth Header**: All protected routes require `x-auth-token: <jwt-token>`

## 🐛 Troubleshooting

### MongoDB Connection Error
```powershell
# Ensure MongoDB is running
mongod

# Or check if service is active
Get-Service MongoDB
```

### Port Already in Use
```powershell
# Kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### Frontend Dependency Issues
```powershell
# Clean reinstall
Remove-Item -Recurse -Force node_modules, package-lock.json
npm cache clean --force
npm install
```

### Authentication Issues
- Clear browser localStorage (F12 → Application → Local Storage)
- Verify backend is running on port 5000
- Check JWT_SECRET in `.env`

### Email/OTP Not Working
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Use Google App Password, not regular password
- Check spam folder for emails
- In development, OTP is logged to console

## 🌟 Future Enhancements

- 💰 Finance Calculator (compound interest, loans, ROI)
- 📊 Statistics Calculator (mean, median, mode, standard deviation)
- 📐 Geometry Calculator (area, volume, perimeter)
- 💱 Currency Converter with live rates
- 🌓 Dark/Light theme toggle
- 📤 Export history (PDF, CSV, Excel)
- 🔍 Search and filter in history/notes
- 🏷️ Tags and categories for notes
- 📱 PWA support for offline use
- 👥 Share calculations with users
- ⚡ WebSocket for real-time updates
- 🌐 Multi-language support (i18n)

## 📄 License

MIT License - Free to use for learning and development

---

Built with ❤️ using TypeScript and MERN Stack
