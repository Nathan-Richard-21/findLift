# Find Lift - Frontend

A modern ride-sharing platform built with React, Vite, and Tailwind CSS.

## 🚀 Live Deployment

- **Frontend URL**: https://findlift.vercel.app (or your Vercel deployment URL)
- **Backend API**: https://find-lift-back.vercel.app

## 📦 Technologies

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Query
- React Hook Form
- Lucide React Icons

## 🛠️ Local Development

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run on `http://localhost:3000`

## 🌐 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=https://find-lift-back.vercel.app/api
VITE_CLIENT_URL=https://findlift.vercel.app
VITE_APP_NAME=Find Lift
VITE_APP_DESCRIPTION=Ride sharing marketplace
VITE_YOCO_PUBLIC_KEY=your_yoco_public_key
```

## 🚢 Deploying to Vercel

### Via Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Import the GitHub repository: `Nathan-Richard-21/findLift`
3. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variables in Vercel Dashboard:
   - `VITE_API_URL`: https://find-lift-back.vercel.app/api
   - `VITE_CLIENT_URL`: Your Vercel frontend URL
   - `VITE_APP_NAME`: Find Lift
   - `VITE_APP_DESCRIPTION`: Ride sharing marketplace
   - `VITE_YOCO_PUBLIC_KEY`: Your Yoco public key

5. Deploy!

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React Context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API service layer
└── utils/           # Utility functions
```

## 🔑 Features

- User Authentication & Authorization
- Ride Search & Booking
- Driver Dashboard
- KYC Verification
- Payment Integration (Yoco)
- Vehicle Management
- Admin Panel
- Real-time Ride Tracking

## 🔒 Security

- Environment variables are used for sensitive data
- API calls use httpOnly cookies for authentication
- CORS configured for production domains
- All builds are minified and optimized

## 📄 License

MIT License
