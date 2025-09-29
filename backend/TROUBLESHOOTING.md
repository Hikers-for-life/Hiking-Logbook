# Backend Server Troubleshooting Guide

## 🚨 Common Crash Causes & Solutions

### 1. **Fixed Issues (Already Resolved)**
- ✅ **Duplicate error handlers** - Removed duplicate middleware
- ✅ **Missing response in error handler** - Fixed error handler
- ✅ **Syntax errors in async functions** - Fixed function syntax
- ✅ **Duplicate route registrations** - Cleaned up duplicate logs

### 2. **Memory Issues**
**Symptoms:** Server crashes with "out of memory" errors
**Solutions:**
```bash
# Check memory usage
npm run pm2:monit

# Restart with memory limit
npm run pm2:restart

# Monitor logs
npm run pm2:logs
```

### 3. **Firebase Connection Issues**
**Symptoms:** "Firebase initialization failed" errors
**Solutions:**
```bash
# Check Firebase credentials
cat .env | grep FIREBASE

# Test Firebase connection
node -e "import('./src/config/firebase.js').then(m => m.initializeFirebase())"
```

### 4. **Port Conflicts**
**Symptoms:** "Port 3001 already in use" errors
**Solutions:**
```bash
# Kill process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Or use different port
PORT=3002 npm run dev
```

### 5. **Rate Limiting Issues**
**Symptoms:** 429 "Too Many Requests" errors
**Solutions:**
- The frontend now has request throttling
- Backend has rate limiting middleware
- Check if multiple instances are running

## 🛠️ Development Commands

### Standard Development
```bash
npm run dev          # Start with nodemon (auto-restart)
```

### Production-like with PM2
```bash
npm install pm2 -g   # Install PM2 globally
npm run dev:pm2      # Start with PM2 (crash-resistant)
npm run pm2:logs     # View logs
npm run pm2:monit    # Monitor performance
npm run pm2:restart  # Restart server
npm run pm2:stop     # Stop server
```

### Debugging
```bash
npm run pm2:logs     # View real-time logs
npm run lint         # Check for code issues
npm test             # Run tests
```

## 🔍 Monitoring & Logs

### Log Files Location
- `logs/err.log` - Error logs
- `logs/out.log` - Output logs  
- `logs/combined.log` - All logs

### Real-time Monitoring
```bash
# Monitor with PM2
npm run pm2:monit

# View logs in real-time
npm run pm2:logs

# Check server health
curl http://localhost:3001/health
```

## 🚀 Deployment Considerations

### Will This Affect Your Deployed Site?
**Short Answer:** No, these fixes will IMPROVE your deployed site.

**Why:**
1. **Better Error Handling** - Prevents crashes in production
2. **Memory Management** - Prevents out-of-memory crashes
3. **Graceful Shutdowns** - Proper cleanup on restarts
4. **Process Management** - PM2 provides auto-restart capabilities

### Production Deployment
```bash
# For production deployment
npm run prod:pm2     # Start with production settings
pm2 startup          # Auto-start on server reboot
pm2 save             # Save current process list
```

## 🆘 Emergency Recovery

### If Server Keeps Crashing
1. **Check logs:**
   ```bash
   npm run pm2:logs
   ```

2. **Restart with clean state:**
   ```bash
   npm run pm2:stop
   npm run dev:pm2
   ```

3. **Check for port conflicts:**
   ```bash
   netstat -ano | findstr :3001
   ```

4. **Verify environment variables:**
   ```bash
   cat .env
   ```

### If Nothing Works
1. **Kill all Node processes:**
   ```bash
   taskkill /F /IM node.exe
   ```

2. **Clean restart:**
   ```bash
   npm install
   npm run dev:pm2
   ```

## 📊 Performance Monitoring

### Memory Usage
- **Normal:** < 100MB
- **Warning:** 100-200MB  
- **Critical:** > 200MB (auto-restart)

### CPU Usage
- **Normal:** < 50%
- **High:** 50-80%
- **Critical:** > 80%

### Restart Triggers
- Memory > 500MB
- 10+ crashes in 1 hour
- Uncaught exceptions
- Unhandled promise rejections

## 🔧 Configuration Files

- `ecosystem.config.js` - PM2 configuration
- `.env` - Environment variables
- `package.json` - Scripts and dependencies

## 📞 Getting Help

If issues persist:
1. Check the logs first: `npm run pm2:logs`
2. Look for specific error messages
3. Check memory/CPU usage: `npm run pm2:monit`
4. Verify all environment variables are set
5. Test Firebase connection separately

