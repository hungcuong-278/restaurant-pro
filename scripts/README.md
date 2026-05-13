# 📜 Scripts

This folder contains automation scripts for testing, monitoring, and maintenance.

## PowerShell Scripts (.ps1)

### check-test-status.ps1
**Purpose**: Check the status of automated tests
**Usage**: `.\scripts\check-test-status.ps1`

### run-all-tests.ps1
**Purpose**: Run all backend and frontend tests
**Usage**: `.\scripts\run-all-tests.ps1`

### run-overnight-tests.ps1
**Purpose**: Run comprehensive test suite (long-running)
**Usage**: `.\scripts\run-overnight-tests.ps1`

### view-test-results.ps1
**Purpose**: Display formatted test results
**Usage**: `.\scripts\view-test-results.ps1`

---

## Shell Scripts (.sh)

### run-all-tests.sh
**Purpose**: Run all tests (Linux/Mac compatible)
**Usage**: `bash scripts/run-all-tests.sh`

---

## Batch Scripts (.bat)

### monitor-servers.bat
**Purpose**: Monitor backend and frontend servers
**Usage**: Double-click or `.\scripts\monitor-servers.bat`

---

## JavaScript Scripts (.js)

### add-print-button.js
**Purpose**: Add print functionality to pages
**Usage**: Node.js script for adding print features

### test-reservation-ui.js
**Purpose**: Test reservation UI components
**Usage**: `node scripts/test-reservation-ui.js`

### verify-fixes.js
**Purpose**: Verify bug fixes across the application
**Usage**: `node scripts/verify-fixes.js`

---

## Running Scripts

**From PowerShell:**
```powershell
cd D:\First
.\scripts\run-all-tests.ps1
```

**From Git Bash / WSL:**
```bash
cd /d/First
bash scripts/run-all-tests.sh
```

**Node.js Scripts:**
```bash
node scripts/verify-fixes.js
```

---

## Script Categories

📊 **Testing Scripts**
- run-all-tests.ps1
- run-all-tests.sh
- run-overnight-tests.ps1
- check-test-status.ps1

🔍 **Monitoring Scripts**
- monitor-servers.bat

✅ **Verification Scripts**
- verify-fixes.js
- view-test-results.ps1

🧪 **UI Testing Scripts**
- test-reservation-ui.js
- add-print-button.js
