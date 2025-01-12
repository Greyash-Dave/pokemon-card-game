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

// Add this near the top of your server.js, before your routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Update session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    },
    proxy: process.env.NODE_ENV === 'production'
};

app.use(session(sessionConfig));

// Supabase client initialization
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Add error handling for Supabase connection
const supabaseErrorHandler = (err) => {
    console.error('Supabase Error:', err);
    logger.error('Supabase Error:', {
        message: err.message,
        code: err.code,
        details: err.details
    });
    return new Error('Database operation failed');
};

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

var logs = [];

const morganFormat = process.env.NODE_ENV === 'production' 
  ? ":remote-addr - :remote-user [:date[clf]] ':method :url HTTP/:http-version' :status :res[content-length] ':referrer' ':user-agent'"
  : "dev";

// app.use(morgan(morganFormat, {
// stream: {
//     write: (message) => {
//     const trimmedMessage = message.trim();
//     const logEntry = `Date: ${new Date().toISOString()} - ${trimmedMessage}`;
//     logs.push(logEntry.replace(/\u001b\[.*?m/g, '')); // Store the log message in the array
//     logger.info(trimmedMessage); // Log the message using your custom logger
//     },
// },
// }));

app.use(morgan(morganFormat, {
    stream: {
        write: (message) => {
        const trimmedMessage = message.trim();
        logs.push(trimmedMessage.replace(/\u001b\[.*?m/g, '')); // Store the log message in the array
        logger.info(trimmedMessage); // Log the message using your custom logger
        },
    },
    }));

console.log(process.env.FRONTEND_URL);

// Authentication middleware
// const isAuthenticated = (req, res, next) => {
//     if (req.session.user) {
//         next();
//     } else {
//         res.status(401).json({ message: 'Not authenticated' });
//     }
// };

// Root endpoint with log display
app.get('/', async (req, res) => {
    const formattedLogs = logs.map(log => `<p>${log}</p>`).join('');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    background-color: #13001a;
                    font-family: monospace;
                    white-space: pre-wrap;
                }

                h1 {
                    color: white;
                    font-size: 2rem;
                }

                p {
                    color:rgb(2, 255, 154);
                    font-size: 1.3rem;
                }
            </style>
        </head>
        <body>
            <h1>Logs:</hi>
            ${formattedLogs}        
        </body>
        </html>
    `);
});



// Routes
// Server-side endpoint
app.post("/result", async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const { playerResult, opponentResult } = req.body;

        // Basic validation
        if (!playerResult || !opponentResult) {
            return res.status(400).json({ 
                message: "Missing required fields",
                details: {
                    hasPlayerResult: !!playerResult,
                    hasOpponentResult: !!opponentResult
                }
            });
        }

        // Insert both results
        const { data, error } = await supabase
            .from('result')
            .insert([
                {
                    player: playerResult.player,
                    deck_list: playerResult.deck_list,
                    card_contribution: playerResult.card_contribution,
                    status: playerResult.status
                },
                {
                    player: opponentResult.player,
                    deck_list: opponentResult.deck_list,
                    card_contribution: opponentResult.card_contribution,
                    status: opponentResult.status
                }
            ])
            .select();

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }

        console.log("Battle results recorded successfully");
        res.json(data);
    } catch (err) {
        console.error("Error in /result POST:", err);
        res.status(500).json({ 
            message: "Server error",
            error: err.message
        });
    }
});

app.post("/decklist", async (req, res) => {
    try {
        console.log("Received deck save request:", req.body);

        const { user_name, deck_name, deck_list } = req.body;

        // Validate required fields
        if (!user_name || !deck_name || !deck_list) {
            return res.status(400).json({ 
                message: "Missing required fields",
                details: {
                    hasUsername: !!user_name,
                    hasDeckName: !!deck_name,
                    hasDeckList: !!deck_list
                }
            });
        }

        // Validate deck list length
        if (!Array.isArray(deck_list) || deck_list.length !== 5) {
            return res.status(400).json({ 
                message: "Invalid deck list",
                details: "Deck must contain exactly 5 cards"
            });
        }

        // Insert the deck
        const { data, error } = await supabase
            .from('decks')
            .insert([{
                user_name,
                deck_name,
                deck_list
            }])
            .select();

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }

        console.log("Deck saved successfully:", data[0]);
        res.json(data[0]);
    } catch (err) {
        console.error("Error saving deck:", err);
        res.status(500).json({ 
            message: "Failed to save deck",
            error: err.message
        });
    }
});

app.get("/deckdisplay/:user", async (req, res) => {
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

app.get('/results/:username', async (req, res) => {
    try {
      const username = req.params.username;
  
      // Check if user is requesting their own results
      if (username !== req.session.user.username) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
  
      // Fetch results from Supabase
      const { data, error } = await supabase
        .from('result')
        .select('*')
        .eq('player', username);
  
      if (error) throw error;
  
      res.json(data);
    } catch (err) {
      logger.error("Error fetching results:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

app.get('/check-auth', (req, res) => {
    if (req.session.user) {
      res.json({
        isLoggedIn: true,
        user: {
          username: req.session.user.username,
          id: req.session.user.id
        }
      });
    } else {
      res.json({
        isLoggedIn: false,
        user: null
      });
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
    console.log('Login request received:', {
        body: req.body,
        headers: req.headers
    });

    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            console.log('Missing credentials:', { username: !!username, password: !!password });
            return res.status(400).json({ 
                message: 'Username and password are required' 
            });
        }

        // Log Supabase query attempt
        console.log('Attempting Supabase query for username:', username);

        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (fetchError) {
            console.error('Supabase fetch error:', fetchError);
            logger.error('Supabase fetch error:', {
                error: fetchError,
                username
            });
            return res.status(500).json({ 
                message: 'Database operation failed',
                error: process.env.NODE_ENV === 'development' ? fetchError : undefined
            });
        }

        // Log user lookup result
        console.log('User lookup result:', { found: !!user });

        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid username or password' 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        // Log password validation result
        console.log('Password validation result:', { isValid: isPasswordValid });

        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid username or password' 
            });
        }

        // Set session
        req.session.user = { 
            username: user.username,
            id: user.id 
        };

        // Log session creation attempt
        console.log('Setting session:', req.session);

        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    reject(err);
                }
                resolve();
            });
        });

        // Log successful login
        console.log('Login successful for user:', username);

        res.json({ 
            message: 'Login successful',
            user: { 
                username: user.username,
                id: user.id
            }
        });

    } catch (error) {
        console.error('Login error:', {
            error,
            stack: error.stack,
            message: error.message
        });
        
        logger.error('Login error:', {
            error: error.message,
            stack: error.stack,
            username: req.body?.username
        });

        res.status(500).json({ 
            message: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Add this route after your other authentication routes (login/register)
app.post('/logout', (req, res) => {
    try {
        // Check if there's an active session
        if (req.session) {
            // Destroy the session
            req.session.destroy(err => {
                if (err) {
                    logger.error('Error during logout:', err);
                    return res.status(500).json({ message: 'Error during logout' });
                }
                
                // Clear the cookie
                res.clearCookie('connect.sid', {
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
                });
                
                logger.info('User logged out successfully');
                res.json({ message: 'Logged out successfully' });
            });
        } else {
            res.json({ message: 'No active session' });
        }
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error during logout' });
    }
});

app.get("/pokemon/:name", async (req, res) => {
    try {
        const pokemonName = req.params.name.toLowerCase();
        
        // First, try to get from cache
        const { data: existingPokemon, error: fetchError } = await supabase
            .from('pokemon_data')
            .select('id, name, data, created_at')
            .eq('name', pokemonName)
            .single();
        
        // Check if we have valid cached data
        if (existingPokemon) {
            const cacheAge = Date.now() - new Date(existingPokemon.created_at).getTime();
            const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

            if (cacheAge < CACHE_DURATION) {
                console.log(`Serving cached data for ${pokemonName}`);
                return res.json(existingPokemon.data);
            }
            console.log(`Cache expired for ${pokemonName}, fetching fresh data`);
        } else {
            console.log(`No cached data found for ${pokemonName}`);
        }

        // Fetch fresh data from PokeAPI
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        if (!response.ok) {
            return res.status(404).json({ 
                message: "Pokemon not found",
                details: `PokeAPI returned status ${response.status}`
            });
        }
        
        const pokeData = await response.json();
        
        // Update or insert the data
        if (existingPokemon) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('pokemon_data')
                .update({ 
                    data: pokeData,
                    created_at: new Date().toISOString()
                })
                .eq('id', existingPokemon.id);

            if (updateError) throw updateError;
        } else {
            // Insert new record
            const { error: insertError } = await supabase
                .from('pokemon_data')
                .insert({
                    name: pokemonName,
                    data: pokeData,
                    created_at: new Date().toISOString()
                });

            if (insertError) throw insertError;
        }
        
        return res.json(pokeData);
    } catch (err) {
        console.error("Error handling pokemon request:", err);
        res.status(500).json({ 
            message: "Server error",
            error: err.message 
        });
    }
});

app.get("/decklist/:user/:name", async (req, res) => {
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
// app.use((err, req, res, next) => {
//     logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
//     if (process.env.NODE_ENV === 'development') {
//         res.status(err.status || 500).json({
//             message: err.message,
//             stack: err.stack
//         });
//     } else {
//         res.status(err.status || 500).json({
//             message: 'Internal server error'
//         });
//     }
// });

// Error handler should be last
// app.use((err, req, res, next) => {
//     logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
//     res.status(err.status || 500).json({
//         message: process.env.NODE_ENV === 'production' 
//             ? 'Internal server error' 
//             : err.message
//     });
// });

// Add more detailed error logging
app.use((err, req, res, next) => {
    console.error('Detailed error:', {
        message: err.message,
        stack: err.stack,
        status: err.status,
        name: err.name
    });
    
    logger.error('Error details:', {
        message: err.message,
        stack: err.stack,
        status: err.status,
        name: err.name,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        error: process.env.NODE_ENV === 'production' 
            ? {} 
            : err
    });
});

// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;