# 🔧 Troubleshooting Guide - AI IaC Platform

## Issue: 404 Error / Unable to Generate Terraform Code

### Problem
- Frontend shows "Failed to load resource: 404 (Not Found)"
- Cannot generate Terraform code
- Upload button doesn't work

### Root Cause
Backend services are not running.

---

## ✅ Solution: Start Backend Services

### Step 1: Navigate to the infra directory

```bash
cd ai-iac-platform/infra
```

### Step 2: Check Docker is running

```bash
docker ps
```

If you get an error, start Docker Desktop first.

### Step 3: Start backend services

**Option A: Using docker compose (newer syntax)**
```bash
docker compose up --build -d
```

**Option B: Using docker-compose (older syntax)**
```bash
docker-compose up --build -d
```

### Step 4: Wait for services to start (30-60 seconds)

Check logs:
```bash
docker compose logs -f
# or
docker-compose logs -f
```

Look for:
- `api-gateway` - Should show "Application startup complete"
- `vision-ai` - Should show "Application startup complete"

### Step 5: Verify backend is running

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"ok"}
```

### Step 6: Start frontend (in new terminal)

```bash
cd ai-iac-platform/apps/idp-ui
npm install  # Only first time
npm run dev
```

### Step 7: Access the application

Open browser: http://localhost:5173

---

## 🎯 Quick Fix Commands

### One-line backend start:
```bash
cd ai-iac-platform/infra && docker compose up --build -d && docker compose logs -f
```

### One-line frontend start:
```bash
cd ai-iac-platform/apps/idp-ui && npm install && npm run dev
```

---

## 🐛 Common Issues

### Issue 1: "docker compose: command not found"

**Solution:** Use `docker-compose` (with hyphen) instead:
```bash
docker-compose up --build -d
```

### Issue 2: Port 8000 already in use

**Solution:** Stop conflicting service:
```bash
# Find process using port 8000
lsof -i :8000
# or
netstat -ano | findstr :8000  # Windows

# Kill the process or change port in docker-compose.yml
```

### Issue 3: Services start but immediately stop

**Solution:** Check logs for errors:
```bash
docker compose logs api-gateway
docker compose logs vision-ai
```

Common causes:
- Missing dependencies
- Python version mismatch
- Port conflicts

### Issue 4: CORS errors in browser console

**Solution:** Ensure you're using `http://localhost:5173` not `http://127.0.0.1:5173`

### Issue 5: "No module named 'generator'"

**Solution:** Rebuild containers:
```bash
cd ai-iac-platform/infra
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 📊 Service Health Checks

Run these commands to verify all services:

### 1. Check containers are running
```bash
cd ai-iac-platform/infra
docker compose ps
```

Expected output:
```
NAME                IMAGE                    STATUS
api-gateway         infra-api-gateway       Up
vision-ai           infra-vision-ai         Up
terraform-runner    infra-terraform-runner  Up (may be exited)
```

### 2. Test API Gateway
```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "status": "healthy",
  "service": "AI IaC Platform API",
  "version": "1.0.0"
}
```

### 3. Test Vision AI
```bash
curl http://localhost:8001/
```

Should return FastAPI welcome or docs page.

### 4. Test file upload (with a test image)
```bash
curl -X POST http://localhost:8000/generate \
  -F "file=@test.png" \
  | jq .
```

---

## 🔄 Complete Reset

If nothing works, do a complete reset:

```bash
# Stop everything
cd ai-iac-platform/infra
docker compose down -v

# Remove all containers and images
docker system prune -a

# Rebuild from scratch
docker compose build --no-cache
docker compose up -d

# Watch logs
docker compose logs -f
```

---

## 📞 Still Having Issues?

### Check these:

1. **Docker Desktop is running**
   - Open Docker Desktop app
   - Check it's not in a error state

2. **Correct directory**
   ```bash
   pwd
   # Should be in: .../ai-iac-platform/infra
   ```

3. **Network connectivity**
   ```bash
   ping localhost
   curl http://localhost:8000/health
   ```

4. **Browser console errors**
   - Open DevTools (F12)
   - Check Console and Network tabs
   - Look for actual error messages

5. **Backend logs**
   ```bash
   docker compose logs --tail=100 api-gateway
   docker compose logs --tail=100 vision-ai
   ```

---

## ✨ Expected Working State

When everything is working:

1. **Backend services running:**
   ```bash
   docker compose ps
   # All services show "Up"
   ```

2. **API responds:**
   ```bash
   curl http://localhost:8000/health
   # Returns: {"status":"ok"}
   ```

3. **Frontend accessible:**
   - Browser: http://localhost:5173
   - Shows AI IaC Platform UI

4. **File upload works:**
   - Upload a PNG/JPEG/drawio file
   - Progress bar shows generation steps
   - Terraform code appears in results

---

## 📝 Debug Checklist

- [ ] Docker Desktop is running
- [ ] Backend services started (`docker compose up -d`)
- [ ] Services are healthy (`curl http://localhost:8000/health`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Browser console shows no CORS errors
- [ ] Using correct URL: `http://localhost:5173`
- [ ] Backend logs show no errors

---

## 🚀 Recommended Startup Sequence

```bash
# Terminal 1: Backend
cd ai-iac-platform/infra
docker compose up --build

# Wait for "Application startup complete" messages

# Terminal 2: Frontend
cd ai-iac-platform/apps/idp-ui
npm run dev

# Browser
# Open: http://localhost:5173
```

---

Need more help? Check the main [README.md](README.md) or create an issue on GitHub.
