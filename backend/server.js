require('dotenv').config();
// ── Startup Debug (remove after confirming env vars on Render) ──
console.log('🔍 ENV CHECK → GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `SET (starts with: ${process.env.GEMINI_API_KEY.substring(0, 8)}...)` : '❌ NOT SET');
console.log('🔍 ENV CHECK → GEMINI_MODEL:', process.env.GEMINI_MODEL || 'not set (will use default)');
// ───────────────────────────────────────────────────────────────
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
if (process.env.CLIENT_URL) {
  const clientUrl = process.env.CLIENT_URL.trim();
  allowedOrigins.push(clientUrl);
  if (clientUrl.startsWith('https://www.')) {
    allowedOrigins.push(clientUrl.replace('https://www.', 'https://'));
  } else if (clientUrl.startsWith('https://')) {
    allowedOrigins.push(clientUrl.replace('https://', 'https://www.'));
  } else if (clientUrl.startsWith('http://www.')) {
    allowedOrigins.push(clientUrl.replace('http://www.', 'http://'));
  } else if (clientUrl.startsWith('http://')) {
    allowedOrigins.push(clientUrl.replace('http://', 'http://www.'));
  }
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy: This origin is not allowed access.'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session — required by Passport even when using JWT (for OAuth flow)
app.use(session({
  secret: process.env.SESSION_SECRET || 'aiinfowave_session_fallback',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }, // true in prod (HTTPS), false in dev
}));

// ── Passport Setup ────────────────────────────────────────────
// Google OAuth strategy configuration
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already signed in with Google
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Existing Google user — return them
            return done(null, user);
          }

          // Check if email already exists (local account with same email)
          const existingEmail = await User.findOne({ email: profile.emails[0].value });
          if (existingEmail) {
            // Link Google account to existing local account
            existingEmail.googleId = profile.id;
            existingEmail.isEmailVerified = true; // Google accounts are pre-verified
            await existingEmail.save();
            return done(null, existingEmail);
          }

          // Brand new Google user — create account
          user = await User.create({
            name: profile.displayName || profile.emails[0].value.split('@')[0],
            email: profile.emails[0].value,
            googleId: profile.id,
            authProvider: 'google',
            isEmailVerified: true, // Google already verified their email
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️ Google OAuth credentials not found in .env file. Google login is disabled.');
}


// Minimal serialize/deserialize (not really used since we use JWT, but Passport needs it)
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '✅ AI InfoWave API is running', status: 'OK' });
});

// ── Routes ────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const internshipRoutes = require('./routes/internships');
const jobRoutes = require('./routes/jobs');
const bookingRoutes = require('./routes/booking');
const projectCallRoutes = require('./routes/projectCall');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const bcrypt = require('bcryptjs');

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/project-call', projectCallRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);



// ── MongoDB Atlas connection ───────────────────────────────────
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB Atlas (ai-infowave)');
      try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        if (email) {
          const existing = await User.findOne({ email: email.toLowerCase() });
          if (!existing) {
            const passwordHash = password ? await bcrypt.hash(password, 12) : null;
            await User.create({
              name: 'Admin',
              email: email.toLowerCase(),
              password: passwordHash,
              isEmailVerified: true,
              authProvider: 'local',
            });
            console.log(`✅ Admin user seeded in User collection: ${email}`);
          } else {
            console.log('✅ Admin user already exists in User collection.');
          }
        }
      } catch (err) {
        console.error('❌ Error seeding admin user:', err.message);
      }
    })

    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
} else {
  console.warn('⚠️ MONGO_URI is not defined in the .env file. Database connectivity is offline.');
}


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Google Client ID loaded: ${process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 15) + '...' : 'NOT FOUND'}`);
});
