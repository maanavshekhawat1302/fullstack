"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const passport_1 = __importDefault(require("passport"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// Middleware
// app.use(cors({
//   origin: 'https://majestic-toffee-0d6f3a.netlify.app/login',
//   credentials: true,
// }));
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        "https://dapper-biscochitos-fd7018.netlify.app"
    ],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(require('cookie-parser')());
app.use(passport_1.default.initialize());
// Routes
// app.use('/api/users', userRoutes);
app.use('/api/auth', auth_1.default);
// Serve React frontend build
const frontendPath = path_1.default.join(__dirname, '../frontend/dist');
app.use(express_1.default.static(frontendPath));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-system';
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server started on port ${process.env.PORT || 5000}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
