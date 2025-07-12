import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scrapeRouter  from './routes/scrape.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing for your frontend
app.use(cors({ origin: 'http://localhost:3000' })); 
// Parse JSON request bodies
app.use(express.json());

// --- API Routes ---

app.use('/api/scrape', scrapeRouter);

// --- Basic Auth Route (for login simulation) ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        res.json({
            success: true,
            message: "Login successful!",
            token: `mock_jwt_${Date.now()}`
        });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials. Use admin/password." });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});