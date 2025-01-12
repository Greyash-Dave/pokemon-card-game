require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { createClient } = require('@supabase/supabase-js');
const session = require('express-session');
const morgan = require('morgan');
const winston = require('winston');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://pokemon-card-game-client.vercel.app',
            'http://localhost:5173',
            'http://localhost:5000'
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'X-CSRF-Token',
        'X-Requested-With',
        'Accept',
        'Accept-Version',
        'Content-Length',
        'Content-MD5',
        'Content-Type',
        'Date',
        'X-Api-Version',
        'Authorization'
    ],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Update session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 60 * 1000
    }
};

app.set('trust proxy', 1);
app.use(session(sessionConfig));

// Supabase client initialization
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Logging middleware
const morganFormat = process.env.NODE_ENV === 'production' 
  ? ":remote-addr - :remote-user [:date[clf]] ':method :url HTTP/:http-version' :status :res[content-length] ':referrer' ':user-agent'"
  : "dev";

app.use(morgan(morganFormat, {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    },
  },
}));

console.log(process.env.FRONTEND_URL);

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
};

// Routes
app.post("/result", isAuthenticated, async (req, res) => {
    try {
        const { player, deck_list, card_contribution, status } = req.body;

        if (player !== req.session.user.username) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (!player || !deck_list || !card_contribution || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const { data, error } = await supabase
            .from('result')
            .insert([{
                player,
                deck_list,
                card_contribution,
                status
            }])
            .select();

        if (error) throw error;

        logger.info(`New result created for player: ${player}`);
        res.json(data[0]);
    } catch (err) {
        logger.error("Error handling /result POST request:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/decklist", isAuthenticated, async (req, res) => {
    try {
        const { user_name, deck_name, deck_list } = req.body;

        if (user_name !== req.session.user.username) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (!user_name || !deck_name || !deck_list) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const { data, error } = await supabase
            .from('decks')
            .insert([{
                user_name,
                deck_name,
                deck_list
            }])
            .select();

        if (error) throw error;

        res.json(data[0]);
    } catch (err) {
        logger.error("Error handling /decklist POST request:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/deckdisplay/:user", isAuthenticated, async (req, res) => {
    try {
        const userName = req.params.user;
        
        if (userName !== req.session.user.username) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { data, error } = await supabase
            .from('decks')
            .select('*')
            .eq('user_name', userName);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        logger.error("Error handling /deckdisplay GET request:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
  
    try {
        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const { data, error } = await supabase
            .from('users')
            .insert([{
                username,
                password: hashedPassword
            }])
            .select();

        if (error) throw error;

        logger.info(`New user registered: ${username}`);
        res.status(201).json({ 
            message: 'User registered successfully', 
            user: { username: data[0].username } 
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
  
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        req.session.user = { username: user.username };
        res.json({ 
            message: 'Login successful', 
            user: { username: user.username } 
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/pokemon/:name", async (req, res) => {
    try {
        const pokemonName = req.params.name.toLowerCase();
        
        // Check cache in Supabase
        const { data: existingPokemon, error } = await supabase
            .from('pokemon_data')
            .select('data, created_at')
            .eq('data->>name', pokemonName)
            .single();
        
        if (existingPokemon) {
            const age = Date.now() - new Date(existingPokemon.created_at).getTime();
            if (age < 24 * 60 * 60 * 1000) { // 24 hours
                return res.json(existingPokemon.data);
            }
        }

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        if (!response.ok) {
            return res.status(404).json({ message: "Pokemon not found" });
        }
        
        const data = await response.json();
        
        // Upsert the new data
        const { error: upsertError } = await supabase
            .from('pokemon_data')
            .upsert({ data })
            .eq('data->>name', pokemonName);

        if (upsertError) throw upsertError;
        
        return res.json(data);
    } catch (err) {
        logger.error("Error handling /pokemon/:name GET request:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/decklist/:user/:name", isAuthenticated, async (req, res) => {
    try {
        const userName = req.params.user;
        const deckName = req.params.name;

        if (userName !== req.session.user.username) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { data, error } = await supabase
            .from('decks')
            .select('*')
            .eq('user_name', userName)
            .eq('deck_name', deckName)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ message: "Deck not found" });
        }

        res.json(data);
    } catch (err) {
        logger.error("Error handling /decklist/:name GET request:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Error handler
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    if (process.env.NODE_ENV === 'development') {
        res.status(err.status || 500).json({
            message: err.message,
            stack: err.stack
        });
    } else {
        res.status(err.status || 500).json({
            message: 'Internal server error'
        });
    }
});

// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;