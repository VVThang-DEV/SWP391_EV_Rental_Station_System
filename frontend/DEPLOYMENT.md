# E-Route Rent - Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Environment Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# Development
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3001

# Production (update with your production values)
VITE_APP_ENV=production
VITE_API_URL=https://your-api-domain.com

# Google Maps (optional - for real integration)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Analytics (optional)
VITE_GA_TRACKING_ID=GA-XXXXXXXXX-X
```

### 2. Build Configuration

The project uses Vite for building. Configuration is in `vite.config.ts`.

## Deployment Options

### Option 1: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Option 2: Netlify

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. Add environment variables in Netlify dashboard
4. Deploy

### Option 3: Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Option 4: Self-hosted

1. Build the project: `npm run build`
2. Upload the `dist` folder to your web server
3. Configure your web server to serve the SPA correctly

## Build Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type checking
npm run type-check
```

## Production Considerations

### 1. Environment Variables

- Set `VITE_APP_ENV=production`
- Configure proper API endpoints
- Add analytics tracking if needed

### 2. Performance

- All assets are optimized by Vite
- Images are served via CDN (Unsplash)
- Code splitting is handled automatically

### 3. Security

- No sensitive data in client-side code
- API endpoints should be secured
- CORS configuration needed for API calls

### 4. Monitoring

- Consider adding error tracking (Sentry)
- Performance monitoring (Google Analytics)
- User analytics for business insights

## Troubleshooting

### Common Issues

1. **Build fails**: Check Node.js version (18+)
2. **Routes not working**: Configure SPA routing on your hosting platform
3. **Environment variables not loading**: Ensure they start with `VITE_`
4. **Images not loading**: Check CORS settings and image URLs

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Build completes successfully
- [ ] All routes work correctly
- [ ] Images and assets load properly
- [ ] API endpoints are accessible
- [ ] Error pages display correctly
- [ ] Mobile responsiveness tested
- [ ] Performance metrics acceptable

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Support

For deployment issues, check:

1. Vite documentation
2. Your hosting provider's documentation
3. Project repository issues
