# WebSocket Verification Runbook

This guide walks through testing real-time WebSocket updates on Integra Explorer using Soketi (Pusher-compatible server).

**Explorer URL:** https://testnet.explorer.integralayer.com

---

## Architecture Overview

Integra Explorer uses Soketi for real-time updates:

```
Frontend (WebSocket Client)
         ↓ (pusher.js plugin)
     Soketi Server (localhost:6002 or remote)
         ↓ (subscribes to channels)
   Backend Job Queue
         ↓ (emits events)
   Real-time Updates
```

Channels monitored:
- `private-workspace-{id}` - Workspace events
- `blocks` - New blocks (public)
- `pending-transactions` - Mempool updates (public)

---

## Test Case 1: Verify Soketi Health

### 1.1 Check Soketi Container Status (Local)

If running locally with Docker:

```bash
docker ps | grep soketi
```

**Expected output:**
```
integra-explorer-soketi  ...  Up 2 hours
```

### 1.2 Check Soketi Health Endpoint (Server)

On the server where explorer is deployed:

```bash
curl -s http://localhost:6002
```

**Expected response:**
```
OK
```

Or for health check:

```bash
curl -s http://localhost:6002/health
```

**Expected response:**
```json
{"status": "ok"}
```

### 1.3 Monitor Soketi Logs (Local Docker)

```bash
docker logs -f integra-explorer-soketi
```

**Expected patterns:**
- Connection logs: `[Socket] NEW CONNECTION: socket_id=...`
- Channel subscriptions: `[Channel] SUBSCRIBE: channel_name=...`
- Message broadcasts: `[Message] BROADCAST: ...`

---

## Test Case 2: Verify Pusher Auth Endpoint

### 2.1 Test Authentication Token Generation

The explorer backend must provide a pusher-auth endpoint for private channels:

```bash
curl -X POST https://testnet.explorer.integralayer.com/pusher-auth \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'socket_id=test-socket-123' \
  -d 'channel_name=private-workspace-1'
```

**Expected response:**
```json
{
  "auth": "KEY:SIGNATURE",
  "channel_data": "{...}"
}
```

### 2.2 Verify Auth Signature Format

Response should include:
- [ ] `auth` field with format `{key}:{signature}`
- [ ] `signature` is HMAC-SHA256 hash (88 characters)
- [ ] `channel_data` (for presence channels) contains JSON

### 2.3 Test with Invalid Socket ID

```bash
curl -X POST https://testnet.explorer.integralayer.com/pusher-auth \
  -d 'socket_id=' \
  -d 'channel_name=private-workspace-1'
```

**Expected response:** 400 or 401 error with message

---

## Test Case 3: Monitor Real-time Block Updates

### 3.1 Open Browser Console

1. Navigate to https://testnet.explorer.integralayer.com
2. Open Developer Tools (F12)
3. Go to Console tab
4. Clear existing logs

### 3.2 Watch for WebSocket Connection

In console, look for messages like:
```
[Pusher] Connected with socket ID: socket-123456
[Pusher] Subscribed to channel: blocks
```

Or check Network tab:
1. Click Network tab
2. Filter by "WS" (WebSocket)
3. Find connection to Soketi (hostname from env config)
4. Click it and check Status: `101 Switching Protocols`

### 3.3 Trigger Block Event

1. Keep browser/console open
2. On another terminal, trigger a new block on testnet (or wait for natural block production)
3. **Expected result:** Console shows:
   ```
   [Pusher Event] Channel: blocks, Event: new-block, Data: {...}
   ```

### 3.4 Verify Block Appears on Page

1. Keep explorer homepage open
2. Watch "Latest Blocks" section
3. Wait for next block (testnet ~2s block time)
4. **Expected result:**
   - [ ] New block appears at top of list without page reload
   - [ ] Block number increments
   - [ ] Timestamp is current
   - [ ] Animations/transitions are smooth

---

## Test Case 4: Monitor Pending Transactions

### 4.1 Watch Pending Channel

In console:
```javascript
// If Pusher object is exposed globally
window.pusher.subscribe('pending-transactions').bind('all', (event) => {
  console.log('Pending transaction:', event);
});
```

Or check Network tab for messages on WebSocket connection.

### 4.2 Submit Transaction

1. Connect wallet
2. Send a transaction (0.01 IRL)
3. Don't wait for confirmation
4. Watch console/Network tab
5. **Expected result:**
   - [ ] Pending transaction event appears in WebSocket messages
   - [ ] Transaction hash matches what you sent
   - [ ] Status shows "pending"

### 4.3 Monitor Confirmation

1. Watch the pending transaction in console
2. Wait for block confirmation
3. **Expected result:**
   - [ ] New event arrives with status "confirmed"
   - [ ] Event includes block number
   - [ ] Explorer page updates automatically

---

## Test Case 5: Test Private Workspace Channel

### 5.1 Subscribe to Workspace Channel

If you have workspace access:

```bash
# Generate auth token
curl -X POST https://testnet.explorer.integralayer.com/pusher-auth \
  -d "socket_id=YOUR_SOCKET_ID" \
  -d "channel_name=private-workspace-YOUR_WORKSPACE_ID"
```

Expected: Valid auth response

### 5.2 Monitor Workspace Events

In console, subscribe to workspace channel:
```javascript
window.pusher.subscribe(`private-workspace-1`).bind('all', (data) => {
  console.log('Workspace event:', data);
});
```

### 5.3 Trigger Workspace Event

From backend, trigger an event:
```bash
# On server with access to explorer backend
cd /path/to/explorer
npm run trigger-event
```

**Expected result:** Event appears in console

---

## Test Case 6: Check Browser Console for WebSocket Errors

### 6.1 Look for Connection Errors

Open Console and check for errors:

**Good signs (expected):**
- No WebSocket errors
- Connection messages show successful connection

**Bad signs (not expected):**
```
WebSocket connection to 'wss://...' failed
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

### 6.2 Check for Auth Failures

**Bad signs:**
```
[Pusher] Error: Failed to subscribe to channel: private-workspace-1
403 Unauthorized
```

**Good signs:**
```
[Pusher] Successfully subscribed to private-workspace-1
```

---

## Test Case 7: Test WebSocket Under Network Conditions

### 7.1 Simulate Slow Network (Browser DevTools)

1. Open Developer Tools
2. Network tab → Click throttling dropdown (top left, usually shows "No throttling")
3. Select "Slow 3G"
4. Refresh explorer
5. **Expected result:**
   - [ ] Page loads and functions despite slow network
   - [ ] WebSocket connects (might take longer)
   - [ ] Block updates still arrive (possibly with delay)
   - [ ] No console errors

### 7.2 Simulate Network Disconnection

1. In DevTools Network tab, click the offline checkbox
2. **Expected result:**
   - [ ] Explorer shows graceful degradation
   - [ ] Real-time updates stop
   - [ ] No JavaScript errors in console
3. Go online again (uncheck offline)
4. **Expected result:**
   - [ ] WebSocket reconnects automatically
   - [ ] Updates resume
   - [ ] No page refresh needed

### 7.3 Simulate High Latency

1. Network tab → throttling → Custom
2. Set: Download 1000 kbps, Upload 1000 kbps, Latency 500ms
3. Refresh explorer
4. **Expected result:**
   - [ ] Updates still arrive (with 500ms+ delay visible)
   - [ ] No connection drops
   - [ ] Page remains usable

---

## Test Case 8: Monitor Soketi Server Logs

### 8.1 View Logs (Local Docker)

```bash
docker logs integra-explorer-soketi | tail -100
```

**Expected patterns:**
```
[2026-03-04T12:34:56] Socket connected: socket-id-123
[2026-03-04T12:34:57] Channel subscribed: blocks
[2026-03-04T12:34:58] Message published: new-block
[2026-03-04T12:35:00] Socket disconnected: socket-id-123
```

### 8.2 Check for Error Patterns

Look for these bad patterns in logs:
- `Failed to authenticate` - Auth endpoint returning errors
- `Out of memory` - Soketi running out of resources
- `Port already in use` - Soketi crashed and restarted
- `Connection refused` - Can't connect to Redis

### 8.3 Monitor Memory Usage

```bash
docker stats integra-explorer-soketi
```

**Expected:**
- Memory usage: < 500MB
- CPU: 0-5% at rest, 10-30% under load

---

## Test Case 9: Connection/Reconnection Behavior

### 9.1 Test Soketi Restart

1. Keep explorer open with console visible
2. Restart Soketi:
   ```bash
   docker restart integra-explorer-soketi
   ```
3. Watch console and network
4. **Expected result:**
   - [ ] WebSocket briefly shows "disconnected"
   - [ ] Within 5-10 seconds, reconnects automatically
   - [ ] New blocks resume appearing

### 9.2 Test Long Idle Connection

1. Open explorer and leave it open for 10 minutes
2. Keep console visible
3. **Expected result:**
   - [ ] WebSocket connection remains active (no timeouts)
   - [ ] Occasional ping/pong messages (Soketi heartbeat)
   - [ ] New blocks continue appearing
   - [ ] No connection drops

### 9.3 Test Multiple Tabs

1. Open explorer in multiple browser tabs (same workspace)
2. **Expected result:**
   - [ ] Each tab establishes its own WebSocket connection
   - [ ] Block updates appear in all tabs simultaneously
   - [ ] No race conditions or duplicate events

---

## Test Case 10: Performance and Load Testing

### 10.1 Monitor Message Throughput

1. Subscribe to multiple channels:
   ```javascript
   ['blocks', 'pending-transactions'].forEach(ch => {
     window.pusher.subscribe(ch).bind('all', (data) => {
       console.log(`[${new Date().toISOString()}] ${ch}:`, data);
     });
   });
   ```
2. Generate load:
   - Send multiple transactions
   - Trigger multiple events
3. **Expected result:**
   - [ ] All messages arrive intact
   - [ ] No message loss
   - [ ] Latency < 500ms

### 10.2 Check Response Rates

With Network tab throttled to "Slow 3G":
1. Submit transaction
2. Check DevTools Network tab for WebSocket frames
3. Count messages per second
4. **Expected:** No bottleneck, messages flow consistently

---

## Test Case 11: Error Handling

### 11.1 Test Invalid Channel Subscription

In console:
```javascript
window.pusher.subscribe('invalid-channel-12345').bind('all', () => {
  console.log('Should not appear');
});
```

**Expected result:**
- Subscription attempt fails (checked in Network tab)
- No message loss on valid channels
- Console shows auth error for invalid channel

### 11.2 Test Auth Failure Recovery

1. Trigger auth failure (e.g., by invalidating workspace access)
2. **Expected result:**
   - [ ] WebSocket disconnects
   - [ ] Errors appear in console
   - [ ] Page shows graceful error message (not crash)

---

## Soketi Docker Compose Configuration

Verify `.docker-compose` or deployment config includes Soketi:

```yaml
soketi:
  image: quay.io/soketi/soketi:latest
  ports:
    - "6002:6001"
  environment:
    SOKETI_DEFAULT_APP_ID: integra-explorer
    SOKETI_DEFAULT_APP_KEY: integra-key
    SOKETI_DEFAULT_APP_SECRET: integra-secret
    SOKETI_REDIS_HOST: redis
    SOKETI_REDIS_PORT: 6379
  depends_on:
    - redis
```

---

## Environment Variables (Backend)

Backend must have these set:

```bash
SOKETI_HOST=localhost          # or remote Soketi server
SOKETI_PORT=6002               # or 6001 if not reversed
SOKETI_DEFAULT_APP_ID=...
SOKETI_DEFAULT_APP_KEY=...
SOKETI_DEFAULT_APP_SECRET=...
SOKETI_SCHEME=http             # or https in production
SOKETI_USE_TLS=false           # or true if https
```

---

## WebSocket Verification Checklist

- [ ] Soketi container is running
- [ ] Soketi health endpoint responds with 200
- [ ] Browser connects to WebSocket without errors
- [ ] Auth endpoint returns valid signatures
- [ ] New blocks appear in real-time
- [ ] Pending transactions appear before confirmation
- [ ] Console shows no WebSocket errors
- [ ] Connection persists for 10+ minutes
- [ ] Reconnection works after network interruption
- [ ] Multiple tabs don't interfere with each other
- [ ] Soketi logs show normal operation
- [ ] Memory usage stays under 500MB
- [ ] Message latency < 500ms
- [ ] Error scenarios degrade gracefully

---

## Expected Response Times

- WebSocket connection: < 2 seconds
- Block event propagation: < 500ms from block production
- Pending transaction event: < 200ms from mempool
- Reconnection after disconnect: < 10 seconds
- Auth token generation: < 100ms

---

## Notes

- Soketi is Pusher-compatible; uses same protocol/auth
- Redis must be running for Soketi to function
- Connection state persists in browser's pusher.js plugin
- Multiple event types can be subscribed simultaneously
- Channel names follow pattern: `[public-|private-]name`
- Private channels require authentication via pusher-auth endpoint
- Testnet may reset occasionally; WebSocket URLs don't change but data does
