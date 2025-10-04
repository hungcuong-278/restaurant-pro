# 📝 Template: Bắt Đầu Tuần Mới

**Mục đích:** Copy template này mỗi khi bắt đầu tuần mới để đảm bảo consistency

---

## 🚀 WORKFLOW SETUP TUẦN MỚI

### Bước 1: Chạy PowerShell Commands

```powershell
# === BẮT ĐẦU TUẦN MỚI ===
# Thay X bằng số tuần (ví dụ: 8, 9, 10...)

$week = 8  # <--- THAY SỐ TUẦN Ở ĐÂY

# Tạo folder
New-Item -Path "docs/reports/week-$week" -ItemType Directory

# Tạo files ban đầu
@(
    "WEEK_${week}_PLAN.md",
    "WEEK_${week}_PROGRESS.md",
    "WEEK_${week}_PHASE_1_PLAN.md",
    "WEEK_${week}_PHASE_1_PROGRESS.md"
) | ForEach-Object {
    New-Item -Path "docs/reports/week-$week/$_" -ItemType File
}

Write-Host "`n✅ Week $week structure created!" -ForegroundColor Green
Write-Host "📁 Location: docs/reports/week-$week/" -ForegroundColor Cyan
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Fill in WEEK_${week}_PLAN.md" -ForegroundColor White
Write-Host "2. Update docs/reports/README.md" -ForegroundColor White
Write-Host "3. Commit: git commit -m 'docs: Initialize Week $week structure'" -ForegroundColor White
```

---

## 📄 Template: WEEK_X_PLAN.md

Copy nội dung này vào `WEEK_X_PLAN.md`:

```markdown
# Week X Development Plan

**Timeline:** [Start Date] - [End Date], 2025  
**Focus:** [Main Topic - e.g., "Dashboard & Analytics"]  
**Team:** [Your Name]

---

## 📊 Overview

### Goals
- [ ] Goal 1: [Description]
- [ ] Goal 2: [Description]
- [ ] Goal 3: [Description]

### Success Metrics
- ✅ [Metric 1]
- ✅ [Metric 2]
- ✅ [Metric 3]

---

## 🎯 Phases

### Phase 1: [Phase Name]
**Timeline:** Day 1-2 (X-Y hours)  
**Status:** ⏳ Pending

**Tasks:**
1. Task 1.1: [Description] (Xh)
2. Task 1.2: [Description] (Xh)
3. Task 1.3: [Description] (Xh)

**Deliverables:**
- [ ] Deliverable 1
- [ ] Deliverable 2

---

### Phase 2: [Phase Name]
**Timeline:** Day 3-4 (X-Y hours)  
**Status:** ⏳ Pending

**Tasks:**
1. Task 2.1: [Description] (Xh)
2. Task 2.2: [Description] (Xh)

**Deliverables:**
- [ ] Deliverable 1
- [ ] Deliverable 2

---

## 🛠️ Technical Stack

### Backend
- [Technology 1]
- [Technology 2]

### Frontend
- [Technology 1]
- [Technology 2]

### Tools
- [Tool 1]
- [Tool 2]

---

## 📅 Daily Breakdown

### Day 1 (Monday)
- [ ] Task A (2h)
- [ ] Task B (3h)
- [ ] Task C (2h)
**Target:** 7h

### Day 2 (Tuesday)
- [ ] Task D (3h)
- [ ] Task E (4h)
**Target:** 7h

### Day 3 (Wednesday)
- [ ] Task F (2h)
- [ ] Task G (3h)
**Target:** 5h

---

## ⚠️ Risks & Challenges

| Risk | Impact | Mitigation |
|------|--------|------------|
| Risk 1 | High | Mitigation strategy |
| Risk 2 | Medium | Mitigation strategy |

---

## 📦 Dependencies

- [ ] Dependency 1: [Description]
- [ ] Dependency 2: [Description]

---

## 📝 Notes

- Note 1
- Note 2

---

**Created:** [Date]  
**Last Updated:** [Date]  
**Status:** 📋 Draft / ✅ Approved
```

---

## 📄 Template: WEEK_X_PROGRESS.md

Copy nội dung này vào `WEEK_X_PROGRESS.md`:

```markdown
# Week X Progress Tracking

**Timeline:** [Start Date] - [End Date], 2025  
**Last Updated:** [Current Date & Time]  
**Overall Progress:** X%

---

## 📊 Phase Status

| Phase | Status | Progress | Time Spent | Time Estimated |
|-------|--------|----------|------------|----------------|
| Phase 1 | 🔄 In Progress | 50% | 3h | 6h |
| Phase 2 | ⏳ Pending | 0% | 0h | 8h |
| Phase 3 | ⏳ Pending | 0% | 0h | 6h |

---

## ✅ Completed Tasks

### [Date] - Task X.Y: [Task Name]
**Time Spent:** Xh / Xh estimated  
**Status:** ✅ Complete

**What was done:**
- Item 1
- Item 2
- Item 3

**Files Modified:**
- `file1.ts` (X lines)
- `file2.tsx` (X lines)

**Commits:**
- `abc1234` - Description

**Screenshots/Evidence:**
[If applicable]

**Challenges:**
- Challenge 1 → Solution

**Next Steps:**
- Step 1
- Step 2

---

## 🔄 In Progress

### Task X.Y: [Task Name]
**Started:** [Date & Time]  
**Progress:** X%  
**Time Spent:** Xh / Xh estimated

**Current Status:**
- [ ] Subtask 1
- [x] Subtask 2
- [ ] Subtask 3

**Blockers:**
- None / [Blocker description]

---

## ⏳ Pending Tasks

### Task X.Y: [Task Name]
**Estimated:** Xh  
**Priority:** High / Medium / Low  
**Dependencies:** [If any]

---

## 📈 Progress Chart

```
Day 1: ████████░░ 80% (6h/8h planned)
Day 2: █████░░░░░ 50% (4h/8h planned)
Day 3: ░░░░░░░░░░  0% (0h/6h planned)
```

---

## 🐛 Issues Encountered

### Issue 1: [Title]
**Severity:** High / Medium / Low  
**Status:** 🔄 In Progress / ✅ Resolved

**Description:**
[Description of the issue]

**Solution:**
[How it was resolved]

**Time Impact:** +Xh

---

## 💡 Learnings

- Learning 1
- Learning 2

---

## 🎯 Next Actions

1. [ ] Action 1 (Priority: High)
2. [ ] Action 2 (Priority: Medium)
3. [ ] Action 3 (Priority: Low)

---

**Overall Status:** 🟢 On Track / 🟡 At Risk / 🔴 Delayed
```

---

## 📄 Template: WEEK_X_PHASE_Y_COMPLETION.md

Copy nội dung này vào `WEEK_X_PHASE_Y_COMPLETION.md`:

```markdown
# Week X Phase Y Completion Report

**Phase:** [Phase Name]  
**Timeline:** [Start Date] - [End Date], 2025  
**Status:** ✅ COMPLETE  
**Time Spent:** Xh / Xh estimated (X% efficiency)

---

## 📊 Executive Summary

Phase Y of Week X has been **successfully completed** with all deliverables met.

**Key Achievements:**
- ✅ Achievement 1
- ✅ Achievement 2
- ✅ Achievement 3

**Time Breakdown:**
- Task 1: Xh
- Task 2: Xh
- Task 3: Xh
- **Total:** Xh / Xh estimated

---

## ✅ Tasks Completed

### Task Y.1: [Task Name]
**Time:** Xh / Xh estimated  
**Status:** ✅ Complete

**Deliverables:**
- [x] Deliverable 1
- [x] Deliverable 2

**Files Created/Modified:**
- `file1.ts` (X lines)
- `file2.tsx` (X lines)

---

### Task Y.2: [Task Name]
[Same structure as above]

---

## 📝 Code Statistics

| Metric | Count |
|--------|-------|
| Files Created | X |
| Files Modified | X |
| Lines Added | X |
| Lines Deleted | X |
| Net Lines | X |
| Functions/Components | X |
| Tests Written | X |

---

## 🧪 Testing Results

### Unit Tests
- Total Tests: X
- Passed: X
- Failed: 0
- Coverage: X%

### Integration Tests
- Total Tests: X
- Passed: X
- Failed: 0

---

## 📦 Deliverables

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Deliverable 1 | ✅ | Notes |
| Deliverable 2 | ✅ | Notes |

---

## 🐛 Issues & Solutions

### Issue 1: [Title]
**Problem:** [Description]  
**Solution:** [How resolved]  
**Time Impact:** +Xh

---

## 💡 Learnings & Improvements

### What Went Well
- Item 1
- Item 2

### What Could Be Improved
- Item 1
- Item 2

### Technical Learnings
- Learning 1
- Learning 2

---

## 📊 Commits

| Hash | Message | Files | Lines |
|------|---------|-------|-------|
| abc1234 | Message | X | +X/-X |
| def5678 | Message | X | +X/-X |

---

## 🎯 Next Steps

- [ ] Begin Phase Y+1
- [ ] Address technical debt
- [ ] Review and refactor

---

## ✅ Completion Checklist

- [x] All tasks completed
- [x] All tests passing
- [x] Code reviewed
- [x] Documentation updated
- [x] Committed and pushed
- [x] Progress report updated

---

**Completed By:** [Your Name]  
**Date:** [Completion Date]  
**Ready for:** Phase Y+1
```

---

## 🔄 Cập Nhật README.md

Thêm vào section "Cấu Trúc Thư Mục" của `docs/reports/README.md`:

```markdown
├── week-X/                          # 🚀 Tuần X (Hiện Tại)
│   ├── WEEK_X_PLAN.md              # Kế hoạch tổng thể
│   ├── WEEK_X_PROGRESS.md          # Tiến độ tổng thể
│   ├── WEEK_X_PHASE_1_PLAN.md      # Kế hoạch Phase 1
│   └── WEEK_X_PHASE_1_PROGRESS.md  # Tiến độ Phase 1
```

Cập nhật section "Trạng Thái Hiện Tại":

```markdown
## 🎯 Trạng Thái Hiện Tại ([Current Date], 2025)

### ✅ Hoàn Thành
- Week 7: Order Management & Payment System (100%)

### 🔄 Đang Làm
- Week X: [Phase Name] (X%)
- Task X.Y: [Task Name] (Next)

### ⏳ Kế Hoạch
- Phase Y+1: [Name] (X-Y hours)
```

---

## 📝 Commit Messages Template

```bash
# Initialize week
git commit -m "docs: Initialize Week X documentation structure"

# Update progress
git commit -m "docs: Update Week X progress (Task X.Y complete)"

# Complete phase
git commit -m "docs: Complete Week X Phase Y report

- All tasks completed (Xh / Xh estimated)
- X files created/modified
- All tests passing
- Ready for Phase Y+1"

# Archive old week
git commit -m "docs: Archive Week X reports"
```

---

## ✅ Checklist Hoàn Chỉnh

Trước khi bắt đầu code, đảm bảo:

- [ ] Đã chạy PowerShell commands tạo folder
- [ ] Đã copy template vào các files
- [ ] Đã điền thông tin vào WEEK_X_PLAN.md
- [ ] Đã cập nhật docs/reports/README.md
- [ ] Đã commit structure mới
- [ ] Đã push lên GitHub

**Sau đó mới bắt đầu code! 🚀**

---

**Created:** October 4, 2025  
**Purpose:** Standardize documentation for all future weeks  
**Use:** Copy this template every time you start a new week
