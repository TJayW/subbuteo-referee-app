# 🚀 Streaming Deployment Checklist

## Pre-Deployment

### 1. Environment Requirements

- [ ] **HTTPS Certificate**: Required for getUserMedia()
  - ✅ Vercel/Netlify auto-provide
  - ✅ Let's Encrypt for custom servers
  - ⚠️ localhost works for dev (exempt)

- [ ] **Browser Support Verification**
  ```bash
  # Test on:
  - Chrome 87+ ✓
  - Firefox 82+ ✓
  - Safari 14+ ✓
  - Mobile Safari (iOS 14+) ✓
  - Mobile Chrome (Android) ✓
  ```

- [ ] **PeerJS Cloud Availability**
  - Check https://peerjs.com/peerserver status
  - Backup: Self-host PeerServer if needed

### 2. Build Verification

```bash
# Clean build
npm run clean
npm install
npm run build

# Verify streaming files exist
ls -la dist/assets/index-*.js  # Should include PeerJS
```

### 3. Configuration

#### Update constants if needed:

```typescript
// src/domain/streaming/types.ts
export const DEFAULT_STREAM_QUALITY: StreamQuality = {
  width: 1280,    // Adjust for your needs
  height: 720,
  frameRate: 30,
};
```

#### Verify hash routing works:

```typescript
// src/utils/hash-router.ts
// Ensure pattern matches: #/watch/:streamKey
```

## Deployment Steps

### Option A: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set production domain
vercel --prod

# 4. Verify
curl https://yourapp.vercel.app/
```

**Vercel Config**: Already configured via `public/404.html`

✅ Hash routing works automatically  
✅ HTTPS included  
✅ Zero config needed

### Option B: Netlify

```bash
# 1. Build
npm run build

# 2. Deploy
npx netlify-cli deploy --prod --dir=dist

# 3. Configure redirects
```

Create `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option C: Self-Hosted (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name yourapp.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/subbuteo/dist;
    index index.html;

    # Hash routing support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS for PeerJS (if self-hosting)
    add_header Access-Control-Allow-Origin "https://peerjs.com" always;
}
```

### Option D: Docker

```dockerfile
FROM nginx:alpine

# Copy built app
COPY dist /usr/share/nginx/html

# Custom nginx config for hash routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# SSL certificates
COPY certs/ /etc/nginx/certs/

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t subbuteo-app .
docker run -p 443:443 subbuteo-app
```

## Post-Deployment Testing

### 1. Basic Connectivity

```bash
# Test HTTPS
curl -I https://yourapp.com

# Verify WebRTC capability
# Open: https://test.webrtc.org/
```

### 2. Streaming Flow (Manual)

**Broadcaster Side**:
- [ ] Open https://yourapp.com
- [ ] Navigate to sidebar
- [ ] Click "Avvia Streaming"
- [ ] Grant camera permission
- [ ] Verify preview shows
- [ ] Copy share link
- [ ] Verify link format: `https://yourapp.com/#/watch/subbuteo-XXX-YYY`

**Viewer Side**:
- [ ] Open share link in incognito window
- [ ] Verify video loads
- [ ] Check "LIVE" indicator shows
- [ ] Verify metadata displays (team names, score)
- [ ] Test on mobile device

**Cleanup**:
- [ ] Stop streaming from broadcaster
- [ ] Verify viewer sees disconnection
- [ ] Check localStorage cleared

### 3. Automated E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Expected: 9 tests pass
# Covers: UI, routing, persistence, errors
```

### 4. Load Testing (Optional)

```typescript
// Simulate multiple viewers
for (let i = 0; i < 10; i++) {
  const viewer = new StreamViewer(onStream, onData, onDisconnect, onError);
  await viewer.connectToStream(streamKey);
}

// Monitor broadcaster performance
console.log('Viewer count:', broadcaster.getStats().connectedViewers);
```

## Monitoring

### 1. Analytics

Check streaming metrics in browser console:

```javascript
// After stream ends, view summary
streamingAnalytics.logSummary();

// Output:
// 📊 Streaming Analytics
//   Session ID: stream-1737489234-abc
//   Duration: 15m 30s
//   Peak Viewers: 8
//   Total Viewers: 12
//   Disconnections: 2
```

### 2. Error Tracking

Add Sentry (optional):

```bash
npm install @sentry/react
```

```typescript
// src/adapters/streaming/streaming-analytics.ts
import * as Sentry from '@sentry/react';

trackError(error: string): void {
  this.trackEvent('error', { error });
  Sentry.captureException(new Error(error));
}
```

### 3. Performance Monitoring

```typescript
// Track streaming performance
navigator.connection.addEventListener('change', () => {
  const { downlink, effectiveType } = navigator.connection;
  console.log('Network:', effectiveType, 'Bandwidth:', downlink, 'Mbps');
  
  if (downlink < 1) {
    // Warn user about poor connection
    showNetworkWarning();
  }
});
```

## Troubleshooting

### Issue: Camera permission denied

**Symptom**: "NotAllowedError: Permission denied"

**Solution**:
1. Verify HTTPS (http:// won't work except localhost)
2. Check browser permissions: `chrome://settings/content/camera`
3. Ensure no other tab is using camera

### Issue: Can't connect to stream

**Symptom**: "Errore di connessione" on viewer page

**Possible causes**:
1. Broadcaster is offline
2. Stream key is invalid
3. Firewall/NAT blocking WebRTC
4. PeerJS cloud is down

**Debug steps**:
```javascript
// Check PeerJS status
fetch('https://0.peerjs.com/')
  .then(r => console.log('PeerJS OK'))
  .catch(e => console.error('PeerJS DOWN', e));

// Test STUN connectivity
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});
pc.createOffer().then(offer => pc.setLocalDescription(offer));
pc.onicecandidate = (e) => {
  if (e.candidate) {
    console.log('ICE candidate:', e.candidate.type);
  }
};
```

### Issue: High latency (>3 seconds)

**Symptom**: Noticeable delay between broadcaster and viewer

**Solutions**:
1. Check network quality on both sides
2. Reduce video quality:
   ```typescript
   { video: { width: 640, height: 480, frameRate: 24 } }
   ```
3. Consider TURN server for problematic NAT

### Issue: Stream crashes with >10 viewers

**Symptom**: Performance degrades, disconnections increase

**Solutions**:
1. Expected behavior (P2P limit ~10-20 viewers)
2. Upgrade to HLS streaming for large audiences:
   ```typescript
   if (viewerCount > 15) {
     // Switch to HLS (requires server)
     migrateToHLS();
   }
   ```

## Rollback Plan

If streaming causes issues:

### 1. Quick Disable

```typescript
// src/features/operator-console/desktop/Sidebar.tsx
// Comment out StreamingControl:

// DISABLED: Temporarily remove streaming
// <StreamingControl ... />
```

Rebuild and redeploy.

### 2. Feature Flag (Better)

```typescript
// src/constants/defaults.ts
export const FEATURES = {
  STREAMING_ENABLED: true, // Set to false to disable
};

// src/features/operator-console/desktop/Sidebar.tsx
{FEATURES.STREAMING_ENABLED && (
  <StreamingControl ... />
)}
```

### 3. Full Removal

```bash
# Revert to previous commit
git log --oneline | grep "streaming"  # Find pre-streaming commit
git revert <commit-sha>
npm run build
git push
```

## Security Hardening

### 1. Content Security Policy

Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' https://0.peerjs.com wss://0.peerjs.com; 
               media-src 'self' blob:;">
```

### 2. Rate Limiting (Optional)

```typescript
// Prevent abuse: max 1 stream per user per 5 minutes
const STREAM_COOLDOWN = 5 * 60 * 1000; // 5 min

let lastStreamStart = 0;

const startBroadcast = async () => {
  const now = Date.now();
  if (now - lastStreamStart < STREAM_COOLDOWN) {
    throw new Error('Please wait before starting another stream');
  }
  lastStreamStart = now;
  // ... rest of implementation
};
```

### 3. Stream Key Validation

```typescript
// Verify stream key format to prevent injection
const STREAM_KEY_PATTERN = /^subbuteo-\d{10,13}-[a-z0-9]{5,10}$/;

if (!STREAM_KEY_PATTERN.test(streamKey)) {
  throw new Error('Invalid stream key format');
}
```

## Success Metrics

Track these KPIs post-deployment:

- **Adoption Rate**: % of matches that use streaming
- **Average Viewers**: Avg viewers per stream
- **Stream Duration**: Avg stream length
- **Success Rate**: % of streams without errors
- **User Feedback**: Qualitative feedback from users

Target:
- ✅ >90% success rate
- ✅ <2% disconnection rate
- ✅ <1s average latency
- ✅ Zero privacy incidents

## Support

### User Documentation

Point users to:
- `/STREAMING_GUIDE.md` - User guide
- `/docs/STREAMING_ARCHITECTURE.md` - Technical docs

### Developer Support

For issues, check:
1. GitHub issues
2. Browser console errors
3. Network tab (check WebRTC connections)
4. PeerJS status page

---

**Checklist Completion**: ☐ Not started | ☑ In progress | ✅ Complete

**Last Updated**: 21 gennaio 2026  
**Deployment Status**: Ready for production  
**Risk Level**: Low (isolated feature, easy rollback)
