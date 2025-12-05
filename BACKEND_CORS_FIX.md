# Backend CORS Configuration Fix

## ❌ Current Problem

The frontend is getting **401 Unauthorized** errors because:
1. The backend is not accepting credentials (cookies) from the Vercel frontend
2. CORS is blocking the requests or cookies aren't being set properly
3. Cookies need special configuration for cross-origin requests in production

## ✅ Required Backend Changes

### 1. Update Backend Environment Variables

Add these to your **backend Vercel environment variables**:

```env
# CRITICAL: Add your Vercel frontend URL
CLIENT_URL=https://findlift.vercel.app

# Or if you have a custom domain
CLIENT_URL=https://your-custom-domain.com

# For development, you had:
# CLIENT_URL=http://localhost:3000

# Make sure these are also set correctly:
NODE_ENV=production
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
```

### 2. Update Backend CORS Configuration

In your backend `index.js` or `server.js`, update CORS settings:

```javascript
import cors from 'cors';

// CORS configuration for production
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true, // CRITICAL: Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// IMPORTANT: Handle preflight requests
app.options('*', cors(corsOptions));
```

### 3. Update Cookie Configuration for Production

In your authentication middleware/controller where cookies are set:

```javascript
// Cookie options for production
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CRITICAL for cross-origin
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

// Example: Setting the token cookie
res.cookie('token', token, cookieOptions);
```

**Why `sameSite: 'none'` is needed:**
- Your frontend is on `findlift.vercel.app`
- Your backend is on `find-lift-back.vercel.app`
- These are different domains, so cookies need `sameSite: 'none'` and `secure: true`

### 4. Full Example Backend Configuration

```javascript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Trust proxy (required for Vercel)
app.set('trust proxy', 1);

// Cookie parser
app.use(cookieParser());

// CORS - MUST come before routes
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your routes...
app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
// etc...

// Cookie setting in auth controller
const login = async (req, res) => {
  try {
    // ... your login logic
    const token = generateToken(user.id);
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    };
    
    res.cookie('token', token, cookieOptions);
    
    res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## 🔍 Verification Steps

After updating the backend:

1. **Deploy the backend changes** to Vercel
2. **Test login** from your frontend
3. **Check browser DevTools** → Network tab → Login request → Response Headers
4. Look for: `Set-Cookie` header with `SameSite=None; Secure`

### Expected Response Headers:
```
Access-Control-Allow-Origin: https://findlift.vercel.app
Access-Control-Allow-Credentials: true
Set-Cookie: token=...; Path=/; HttpOnly; Secure; SameSite=None
```

## 🚨 Common Mistakes to Avoid

1. ❌ **Not setting `sameSite: 'none'` in production** - Cookies won't be sent cross-origin
2. ❌ **Not setting `secure: true` with `sameSite: 'none'`** - Browsers require HTTPS
3. ❌ **CORS middleware after routes** - Must be before routes
4. ❌ **Wrong CLIENT_URL** - Must exactly match your frontend URL (no trailing slash)
5. ❌ **Not trusting proxy on Vercel** - Use `app.set('trust proxy', 1)`

## 📝 Quick Checklist

Backend environment variables in Vercel:
- [ ] `CLIENT_URL=https://findlift.vercel.app` (your actual frontend URL)
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET=<your-secret>`

Backend code:
- [ ] CORS configured with `credentials: true`
- [ ] CORS origin set to `process.env.CLIENT_URL`
- [ ] `app.set('trust proxy', 1)` set
- [ ] Cookie options have `sameSite: 'none'` in production
- [ ] Cookie options have `secure: true` in production
- [ ] CORS middleware before routes

Frontend (already correct):
- [x] `withCredentials: true` in axios
- [x] `VITE_API_URL=https://find-lift-back.vercel.app/api`

## 🔧 Testing Locally with Production Settings

To test cross-origin cookies locally:

```javascript
// Backend - use ngrok or similar to get HTTPS
const cookieOptions = {
  httpOnly: true,
  secure: true, // Force HTTPS
  sameSite: 'none',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
};
```

## 📞 Need Help?

If issues persist after these changes:
1. Check browser console for CORS errors
2. Check Network tab → Login request → Response headers
3. Verify `Set-Cookie` header is present
4. Check if cookies are being stored in DevTools → Application → Cookies

The issue is **100% on the backend** - the frontend is configured correctly.
