# 🔧 CRITICAL: Dev Server Not Running - Quick Fix

## 🚨 Problem
Your website shows **nothing** at all (not even landing page) because:
1. Dev server crashed or serving broken build
2. PowerShell execution policy blocking npm commands

---

## ✅ IMMEDIATE FIX (Choose One)

### **Option 1: Use Command Prompt (CMD) - EASIEST**

1. **Open Command Prompt** (not PowerShell!)
   - Press `Win + R`
   - Type: `cmd`
   - Press Enter

2. **Navigate to project**
   ```cmd
   cd C:\Users\emfat\ExamSense
   ```

3. **Start dev server**
   ```cmd
   npm run dev
   ```

4. **You should see:**
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:8080/
   ➜  Network: http://192.168.43.124:8080/
   ```

5. **Open browser:** http://192.168.43.124:8080

---

### **Option 2: Fix PowerShell (One-Time Setup)**

1. **Right-click PowerShell → Run as Administrator**

2. **Run this command ONCE:**
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Type `Y` and press Enter**

4. **Close and reopen normal PowerShell**

5. **Start server:**
   ```powershell
   cd C:\Users\emfat\ExamSense
   npm run dev
   ```

---

### **Option 3: Use Git Bash (If Installed)**

1. **Open Git Bash**

2. **Navigate and start:**
   ```bash
   cd /c/Users/emfat/ExamSense
   npm run dev
   ```

---

## 🔍 What I Just Did

I killed the stuck process on port 8080 (PID 1452) that was preventing your server from starting properly.

**Before:** Port 8080 had a crashed/broken process
**Now:** Port 8080 is free and ready for dev server

---

## ✅ After Starting Server

### You Should See This in Terminal:
```
  VITE v5.4.10  ready in 1234 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.43.124:8080/
  ➜  press h + enter to show help
```

### Then Open Browser:
- **From your computer:** http://localhost:8080
- **From your phone:** http://192.168.43.124:8080

### What You Should See:
1. ✅ **Landing page** loads immediately
2. ✅ Login button works
3. ✅ After login → Subjects page loads
4. ✅ No blank pages

---

## 🚨 If Still Showing Nothing

### Check 1: Is Server Actually Running?
Look at terminal - should say "ready in xxx ms"

### Check 2: Correct URL?
```
✅ CORRECT: http://192.168.43.124:8080
❌ WRONG:   http://192.168.43.124:8080/subjects (go to root first)
```

### Check 3: Browser Console Errors?
1. Press F12 in browser
2. Check Console tab
3. Any red errors?

### Check 4: Clear Browser Cache
1. Press F12
2. Right-click refresh button
3. Click "Empty Cache and Hard Reload"

---

## 🔍 Quick Diagnostic

If you can access the site now, run this in browser console:

```javascript
// Test 1: Check if React app loaded
console.log('React app:', document.getElementById('root'));

// Test 2: Check Supabase
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

// Test 3: Check routing
console.log('Current path:', window.location.pathname);
```

---

## 📝 Common Terminal Messages

### ✅ GOOD - Server Running:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:8080/
```

### ❌ BAD - Port in Use:
```
Error: listen EADDRINUSE: address already in use :::8080
```
**Fix:** Kill process (see below)

### ❌ BAD - PowerShell Error:
```
cannot be loaded because running scripts is disabled
```
**Fix:** Use CMD instead or fix execution policy (above)

---

## 🔧 Emergency Commands

### Kill Process on Port 8080
```powershell
# Find process
netstat -ano | findstr :8080

# Kill it (replace XXXX with PID from above)
taskkill /F /PID XXXX
```

### Check if Server is Running
```powershell
# Should show node.exe process
netstat -ano | findstr :8080
```

### Restart Server (After Killing)
```cmd
npm run dev
```

---

## 🎯 Step-by-Step Right Now

**DO THIS NOW:**

1. ✅ **Port is already cleared** (I killed the stuck process)

2. ⏭️ **Open CMD** (not PowerShell)
   ```
   Win + R → type "cmd" → Enter
   ```

3. ⏭️ **Navigate to project:**
   ```cmd
   cd C:\Users\emfat\ExamSense
   ```

4. ⏭️ **Start server:**
   ```cmd
   npm run dev
   ```

5. ⏭️ **Wait for "ready in xxx ms"**

6. ⏭️ **Open browser:**
   ```
   http://192.168.43.124:8080
   ```

7. ✅ **Should see landing page!**

---

## 🆘 Still Not Working?

Share this info:
1. **Terminal output** after running `npm run dev`
2. **Browser console errors** (F12 → Console tab)
3. **What you see** in browser (blank? error? loading forever?)

---

## 📌 Key Point

**The server MUST be running for the site to work.**

No server = No website = Blank page

Your server was stuck/crashed. I cleared it. Now you need to start it fresh using CMD.

**Start the server now and let me know what you see!** 🚀