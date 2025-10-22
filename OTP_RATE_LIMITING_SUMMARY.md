# OTP Rate Limiting & Security - Complete Implementation

## 🎯 Requirements Implemented

### 1. **OTP Expires in 5 Minutes** ✅
Changed from 10 minutes to 5 minutes for better security.

### 2. **Rate Limiting** ✅
- **1 OTP per minute**: Users must wait 60 seconds between OTP requests
- **Max 3 OTPs in 5 minutes**: After 3 requests, users must wait 5 minutes

### 3. **Resend Timer** ✅
- 60-second countdown timer
- Shows "Resend OTP in Xs" message
- Button appears after timer expires

---

## 🔧 Implementation Details

### 1. OTP Expiration (5 Minutes)

**File: `/src/app/api/checkout/send-otp/route.ts`**
```typescript
// Changed from 10 minutes to 5 minutes
const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
```

**API Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300  // 5 minutes in seconds
}
```

### 2. Rate Limiting Logic

**File: `/src/lib/otp-store.ts`**

#### Check 1: One Minute Cooldown
```typescript
// Check if OTP was sent in the last 1 minute
const recentOTP = await prisma.oTP.findFirst({
  where: {
    email: email.toLowerCase(),
    createdAt: { gte: oneMinuteAgo }
  }
});

if (recentOTP) {
  const retryAfter = 60 - secondsSinceLastOTP;
  return {
    allowed: false,
    message: `Please wait ${retryAfter} seconds before requesting a new OTP.`,
    retryAfter
  };
}
```

#### Check 2: Maximum 3 OTPs in 5 Minutes
```typescript
// Check total OTP requests in last 5 minutes
const otpCount = await prisma.oTP.count({
  where: {
    email: email.toLowerCase(),
    createdAt: { gte: fiveMinutesAgo }
  }
});

if (otpCount >= 3) {
  return {
    allowed: false,
    message: 'Maximum OTP requests reached. Please try again after 5 minutes.',
    retryAfter: 300 // 5 minutes
  };
}
```

### 3. Frontend Timer Implementation

**File: `/src/components/Checkout/CheckoutWithOTP.tsx`**

#### Timer State
```typescript
const [resendTimer, setResendTimer] = useState(0);
```

#### Timer Effect
```typescript
useEffect(() => {
  if (resendTimer > 0) {
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }
}, [resendTimer]);

// Start 60-second timer when modal opens
useEffect(() => {
  if (showOTPModal) {
    setResendTimer(60);
  }
}, [showOTPModal]);
```

#### Timer Display
```tsx
{resendTimer > 0 ? (
  <p className="text-sm text-gray-500">
    Resend OTP in <span className="font-medium text-dark">{resendTimer}s</span>
  </p>
) : (
  <button onClick={handleResendOTP}>
    Resend OTP
  </button>
)}
```

### 4. Rate Limit Error Handling

#### API Response (429 Status)
```json
{
  "error": "Please wait 45 seconds before requesting a new OTP.",
  "retryAfter": 45
}
```

#### Frontend Handling
```typescript
if (response.status === 429) {
  toast.error(data.error, { duration: 5000 });
  if (data.retryAfter) {
    setResendTimer(data.retryAfter); // Set timer to remaining seconds
  }
}
```

---

## 🎨 User Experience

### Scenario 1: First OTP Request
```
1. User fills checkout form
2. Clicks "Proceed to Checkout"
3. ✅ OTP sent immediately
4. Modal shows: "OTP expires in 5 minutes"
5. Timer starts: "Resend OTP in 60s"
```

### Scenario 2: Resend Within 1 Minute
```
1. User clicks "Resend OTP" before 60 seconds
2. ❌ Button is disabled (timer still counting)
3. Shows: "Resend OTP in 30s"
4. User waits for timer to reach 0
5. ✅ Button becomes active
```

### Scenario 3: Resend After 1 Minute
```
1. Timer reaches 0
2. "Resend OTP" button appears
3. User clicks button
4. ✅ New OTP sent
5. Timer resets to 60s
6. Old OTP cleared from input
```

### Scenario 4: Too Many Requests (3 in 5 minutes)
```
1. User requests 3rd OTP within 5 minutes
2. ✅ 3rd OTP sent (last one allowed)
3. User tries to request 4th OTP
4. ❌ Error: "Maximum OTP requests reached"
5. Timer shows: "Resend OTP in 300s" (5 minutes)
6. User must wait 5 minutes
```

### Scenario 5: Expired OTP
```
1. User receives OTP
2. Waits more than 5 minutes
3. Enters OTP
4. ❌ Error: "OTP has expired"
5. Clicks "Resend OTP"
6. ✅ New OTP sent (if within rate limits)
```

---

## 🔒 Security Features

### 1. Time-Based Limits
- **OTP Expiration**: 5 minutes
- **Resend Cooldown**: 60 seconds
- **Rate Limit Window**: 5 minutes

### 2. Request Limits
- **Per Minute**: 1 OTP
- **Per 5 Minutes**: 3 OTPs maximum
- **Automatic Cleanup**: Expired OTPs removed every 5 minutes

### 3. User Protection
- Clear error messages
- Countdown timers
- Security disclaimer
- Email verification

---

## 📊 Rate Limiting Rules

| Rule | Limit | Action if Exceeded |
|------|-------|-------------------|
| **Minimum Gap** | 60 seconds | Show countdown timer |
| **Maximum Requests** | 3 per 5 minutes | Block for 5 minutes |
| **OTP Validity** | 5 minutes | OTP expires |
| **Resend Cooldown** | 60 seconds | Button disabled |

---

## 🧪 Testing Scenarios

### Test 1: Normal Flow
```
1. Request OTP → ✅ Sent
2. Wait 60s → ✅ Can resend
3. Request again → ✅ Sent
4. Total: 2 OTPs in 5 minutes ✅
```

### Test 2: Too Fast
```
1. Request OTP → ✅ Sent
2. Try resend immediately → ❌ "Wait 60 seconds"
3. Timer shows countdown → ✅
4. Wait for timer → ✅ Can resend
```

### Test 3: Maximum Requests
```
1. Request OTP #1 → ✅ Sent (wait 60s)
2. Request OTP #2 → ✅ Sent (wait 60s)
3. Request OTP #3 → ✅ Sent
4. Request OTP #4 → ❌ "Maximum requests reached"
5. Timer shows 300s (5 minutes) → ✅
```

### Test 4: Expired OTP
```
1. Request OTP → ✅ Sent
2. Wait 6 minutes → ⏱️
3. Enter OTP → ❌ "OTP has expired"
4. Request new OTP → ✅ Sent (if within limits)
```

---

## 📁 Files Modified

### 1. Backend Files

**`/src/lib/otp-store.ts`**
- Added `checkRateLimit()` method
- Checks 1-minute cooldown
- Checks 3-request limit in 5 minutes
- Returns retry time if blocked

**`/src/app/api/checkout/send-otp/route.ts`**
- Added rate limit check before sending OTP
- Changed expiration to 5 minutes
- Returns 429 status for rate limit errors
- Includes `retryAfter` in response

### 2. Frontend Files

**`/src/components/Checkout/CheckoutWithOTP.tsx`**
- Added resend timer state
- Added timer countdown effect
- Added rate limit error handling
- Updated OTP expiration display to 5 minutes
- Shows countdown in UI

### 3. Database Schema

**`/prisma/schema.prisma`**
- OTP model with `createdAt` field (used for rate limiting)
- Indexes on `email` and `expiresAt` for fast queries

---

## 🎯 Benefits

### Security
- ✅ Prevents OTP spam/abuse
- ✅ Limits brute force attempts
- ✅ Shorter OTP validity (5 min vs 10 min)
- ✅ Automatic cleanup

### User Experience
- ✅ Clear countdown timers
- ✅ Helpful error messages
- ✅ Visual feedback
- ✅ Prevents accidental spam

### System Performance
- ✅ Reduces unnecessary OTP generation
- ✅ Reduces email sending load
- ✅ Database-backed tracking
- ✅ Indexed queries for speed

---

## 📝 Error Messages

### Rate Limit Errors
```
"Please wait 45 seconds before requesting a new OTP."
"Maximum OTP requests reached. Please try again after 5 minutes."
```

### OTP Errors
```
"OTP has expired. Please request a new OTP."
"Invalid OTP. Please check and try again."
"OTP not found or expired. Please request a new OTP."
```

### Success Messages
```
"OTP sent to email@example.com! Valid for 5 minutes."
"New OTP sent! Valid for 5 minutes."
```

---

## ✅ Summary

### What's Implemented
1. ✅ **5-minute OTP expiration** (changed from 10 minutes)
2. ✅ **1 OTP per minute** rate limit
3. ✅ **Max 3 OTPs in 5 minutes** rate limit
4. ✅ **60-second resend timer** with countdown
5. ✅ **Rate limit error handling** with retry times
6. ✅ **Clear user feedback** and error messages

### Security Levels
- 🔒 **Time-based**: OTP expires in 5 minutes
- 🔒 **Frequency-based**: 1 request per minute
- 🔒 **Volume-based**: 3 requests per 5 minutes
- 🔒 **User-friendly**: Clear timers and messages

### Next Steps
1. Run migration: `npx prisma migrate dev --name add_otp_table`
2. Test the rate limiting
3. Monitor OTP usage in production
4. Adjust limits if needed

---

**Status**: ✅ Fully implemented and ready to test after migration!
