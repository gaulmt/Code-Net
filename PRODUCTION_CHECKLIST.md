# ✅ Production Deployment Checklist

## Pre-Deployment

### 1. Code Quality
- [ ] All features tested and working
- [ ] No console errors
- [ ] No TypeScript/ESLint errors
- [ ] Code reviewed and approved
- [ ] All dependencies up to date

### 2. Environment Setup

#### Backend (.env)
- [ ] `GMAIL_USER` configured
- [ ] `GMAIL_APP_PASSWORD` configured (16-character app password)
- [ ] `PORT` set (optional, defaults to 3001)

#### Frontend (client/.env)
- [ ] `VITE_FIREBASE_API_KEY` set
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` set
- [ ] `VITE_FIREBASE_DATABASE_URL` set
- [ ] `VITE_FIREBASE_PROJECT_ID` set
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` set
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `VITE_FIREBASE_APP_ID` set

### 3. Firebase Configuration
- [ ] Firebase project created
- [ ] Email/Password authentication enabled
- [ ] Google Sign-In enabled (if using)
- [ ] Realtime Database created
- [ ] Database rules uploaded from `FIREBASE_RULES_PRODUCTION.json`
- [ ] API key restrictions configured (optional but recommended)

### 4. Build Test
- [ ] Run `cd client && npm run build` successfully
- [ ] Run `npm run preview` and test locally
- [ ] Check build size (should be reasonable)
- [ ] All assets loading correctly

---

## Deployment Steps

### Option A: Vercel (Recommended)

#### Frontend
1. [ ] Install Vercel CLI: `npm install -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Deploy: `cd client && vercel --prod`
4. [ ] Add environment variables in Vercel dashboard
5. [ ] Test deployed site
6. [ ] Configure custom domain (optional)

#### Backend
1. [ ] Choose platform (Railway/Render/Vercel Serverless)
2. [ ] Deploy backend
3. [ ] Add environment variables
4. [ ] Test OTP endpoint
5. [ ] Update backend URL in frontend code
6. [ ] Redeploy frontend with new backend URL

### Option B: Netlify

1. [ ] Install Netlify CLI: `npm install -g netlify-cli`
2. [ ] Login: `netlify login`
3. [ ] Deploy: `cd client && netlify deploy --prod`
4. [ ] Add environment variables in Netlify dashboard
5. [ ] Test deployed site
6. [ ] Deploy backend separately
7. [ ] Update backend URL in frontend

### Option C: Manual Deploy

1. [ ] Build: `cd client && npm run build`
2. [ ] Upload `client/dist` folder to hosting
3. [ ] Configure server for SPA routing
4. [ ] Add environment variables
5. [ ] Deploy backend separately
6. [ ] Update backend URL

---

## Post-Deployment

### 1. Functionality Testing
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] OTP email received
- [ ] OTP verification works
- [ ] Login works
- [ ] Google Sign-In works (if enabled)
- [ ] Create project works
- [ ] Join project works
- [ ] File operations work (create, edit, delete)
- [ ] Folder operations work
- [ ] Code sync works
- [ ] File locking works
- [ ] Download files works
- [ ] Download ZIP works
- [ ] Invite members works
- [ ] Friend system works
- [ ] Notifications work
- [ ] Chat works

### 2. Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Real-time sync latency < 500ms
- [ ] No memory leaks
- [ ] Mobile responsive

### 3. Security Checks
- [ ] Firebase rules working correctly
- [ ] No sensitive data in console
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] API keys not exposed in client code
- [ ] Rate limiting on backend (if applicable)

### 4. Monitoring Setup
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Analytics configured (Google Analytics/Vercel Analytics)
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Performance monitoring
- [ ] Log aggregation

### 5. Documentation
- [ ] README updated with production URL
- [ ] API documentation updated
- [ ] User guide created/updated
- [ ] Admin guide created/updated
- [ ] Deployment guide documented

---

## Rollback Plan

If something goes wrong:

1. [ ] Identify the issue
2. [ ] Check logs (Vercel/Netlify/Railway dashboard)
3. [ ] Rollback to previous deployment:
   - Vercel: Use dashboard to rollback
   - Netlify: Use dashboard to rollback
   - Manual: Redeploy previous version
4. [ ] Fix issue locally
5. [ ] Test thoroughly
6. [ ] Redeploy

---

## Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Check user feedback

### Weekly
- [ ] Review analytics
- [ ] Check performance metrics
- [ ] Update dependencies (if needed)
- [ ] Backup Firebase data

### Monthly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Feature planning
- [ ] User survey

---

## Emergency Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/help
- **Netlify Support**: https://www.netlify.com/support

---

## Quick Commands

```bash
# Build and test locally
cd client
npm run build
npm run preview

# Deploy to Vercel
cd client
vercel --prod

# Deploy to Netlify
cd client
netlify deploy --prod

# Check logs (Railway)
railway logs

# Rollback (Vercel)
vercel rollback

# Check build size
cd client/dist
du -sh .
```

---

## Success Metrics

After deployment, track:

- [ ] Uptime > 99.9%
- [ ] Page load time < 3s
- [ ] Error rate < 0.1%
- [ ] User satisfaction > 4/5
- [ ] Active users growing
- [ ] No critical bugs

---

## Notes

- Always test in staging before production
- Keep backups of Firebase data
- Document all changes
- Communicate with users about downtime
- Have a rollback plan ready

---

**Last Updated**: [Date]
**Deployed By**: [Name]
**Production URL**: [URL]
**Backend URL**: [URL]
