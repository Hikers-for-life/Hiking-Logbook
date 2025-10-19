
#  Hiking Logbook


![Test Coverage](https://img.shields.io/badge/Test%20Coverage-81.31%25-brightgreen)

Hiking Logbook is a modern web app that lets users track their hikes, set goals, earn achievements, and share their journeys with friends through a social activity feed. It combines adventure tracking with community interaction, offering a fun and motivating way to explore the outdoors and connect with fellow hikers.

##  Acknowledgments

- **Annah Mlimi 2558137**
-  **Risuna Ntimana 2684367**
-  **Ntokozo Skosana 2440810**
-  **Stelly Jane Ngono Onana 2744075**
-  **Naledi Mogomotsi 2684883**

  
##  Features


- **User Authentication** - Secure Firebase-based authentication system
- **Hike Logging** - Record and track your hiking adventures
- **Profile Management** - Customize your hiking preferences and profile
- **Achievement System** - Earn badges and track your progress
- **Social Features** - Connect with other hikers and share experiences
- **Responsive Design** - Works seamlessly on desktop and mobile devices

##  Project Structure


```
Hiking-Logbook/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
|   |   ├── models/         # Database Schema
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── tests/              # Test files
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend documentation
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
|   |   ├── config/         # firebase config
|   |   ├── contexts/       # React contexts (Auth, etc.)
|   |   ├── hooks/          # custom React hooks that encapsulate reusable logic
│   │   ├── lib/            #library for common files, utility classes
|   |   ├── mocks/          # mock files
│   │   ├── pages/          # Page components
|   |   ├── tests/          # frontend tests
│   │   └── App.js          # Main application component
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Frontend documentation
├── docs/                   # Project documentation
└── README.md               # This file
```

##  Running the Web App locally

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase Project** with Authentication and Firestore enabled

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Hiking-Logbook
```

### 2. Main Folder Setup
```bash
cd Hiking-Logbook

# Install dependencies
npm install
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your Firebase configuration
# (See backend/README.md for detailed setup)

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your Firebase and API configuration
# (See frontend/README.md for detailed setup)

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`


### Environment Files

#### Backend (`.env`)
```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
# ... other Firebase config
```

#### Frontend (`.env`)
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```


For detailed API documentation, see [backend/README.md](backend/README.md)



##  Development


### Available Scripts

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

#### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier


### Development Guidelines

- Follow the existing code structure
- Add tests for new features
- Update documentation
- Follow ESLint and Prettier rules
- Use conventional commit messages

##  Support

For issues and questions:

1. Check the official documentation site [here](https://hikers-for-life.github.io/Hiking-Logbook/)
2. Review the backend and frontend README files
3. Check existing issues
4. Create a new issue with detailed description




**Happy Hiking! **


*Built with ❤️ for the hiking community*









