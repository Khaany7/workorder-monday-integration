# Monday.com Automation

A full-stack web application for automating work order management with user authentication, work order tracking, and Monday.com integration.

## 🚀 Features

- **User Authentication** - JWT-based signup/login with password validation
- **Work Order Management** - Create, view, and track work orders
- **Monday.com Integration** - Automatic board updates via GraphQL API
- **PDF Processing** - Extract work order data from PDF attachments
- **Modern UI** - React + Tailwind CSS with smooth animations
- **Secure** - Password hashing, JWT tokens, protected routes

## 📋 Team

- Saim Baig (12265)
- M Faizan (11491)
- Abdurrehman Yousafzai (12896)
- Zain ul Abdeen (14662)

**Supervisor:** Salman Khalid

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- SQLite Database
- JWT Authentication
- bcrypt Password Hashing
- Multer File Uploads
- PDF Parsing

**Frontend:**
- React 19
- Vite
- React Router
- Tailwind CSS
- Custom Animations

**Integration:**
- Monday.com API (GraphQL)
- IMAP Email Monitoring
- Axios HTTP Client

## 📦 Installation

### Prerequisites
- Node.js 14+ installed
- npm package manager
- Monday.com account with API token

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd workorder-monday-integration
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
```

4. **Configure environment variables**

Create `.env` file in the root directory:
```env
# Monday.com
MONDAY_API_TOKEN=your_monday_api_token
BOARD_ID=your_board_id

# Email (for automation)
EMAIL=your_email@domain.com
PASSWORD=your_email_password
IMAP_SERVER=imap.your-provider.com

# JWT Secret
JWT_SECRET=your_secret_key_change_in_production

# Server Port
PORT=5000
```

## 🚀 Running the Application

### Start Backend Server
```bash
npm start
# Server runs on http://localhost:5000
```

### Start Frontend Dev Server
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### Access the Application
Open your browser to `http://localhost:5173`

## 📱 Usage

### 1. Sign Up
- Navigate to the signup page
- Enter your name, email, and password
- Password must contain: 8+ characters, uppercase, number, special character
- Click "Sign Up"

### 2. Login
- Enter your email and password
- Click "Login"
- You'll be redirected to the dashboard

### 3. Create Work Order
- Click "+ New Work Order" button
- Fill in the required fields (Project, WO#)
- Optionally add PO#, State, PM, and Notes
- Click "Create Work Order"
- The work order will be saved and sent to Monday.com

### 4. View Work Orders
- All your work orders are displayed on the dashboard
- Each card shows project details, WO#, PO#, state, PM, and notes

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Work Orders (Protected)
- `GET /api/workorders` - Get all work orders
- `POST /api/workorders` - Create new work order
- `GET /api/workorders/:id` - Get specific work order
- `POST /api/workorders/upload` - Upload PDF and extract data

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Workorders Table
```sql
CREATE TABLE workorders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project TEXT,
  wo TEXT,
  po TEXT,
  state TEXT,
  pm TEXT,
  notes TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

## 🧪 Testing

### Manual Testing
1. Test signup with various validation scenarios
2. Test login with valid/invalid credentials
3. Test work order creation
4. Verify Monday.com board updates
5. Test protected route access

### Automated Testing (Coming Soon)
- Unit tests for authentication service
- Integration tests for API endpoints
- E2E tests for user flows

## 📊 SQA Documentation

For the complete SQA project report, test plans, bug reports, and JMeter performance testing results, please refer to the `testing/` directory.

## 🎨 UI Screenshots

The application features a modern, responsive design with:
- Gradient backgrounds (purple to violet)
- Smooth animations (slideUp, slideDown)
- Form validation with real-time feedback
- Card-based work order display
- Responsive grid layouts

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Signed with secret key, 24-hour expiration
- **Protected Routes**: Middleware verification on all work order endpoints
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: React auto-escaping

## 📝 License

MIT

## 🙏 Acknowledgments

- Supervisor: Salman Khalid
- Monday.com API Documentation
- React and Vite communities
- Tailwind CSS team

---

**Project Completion:** January 1, 2026  
**Version:** 1.0.0