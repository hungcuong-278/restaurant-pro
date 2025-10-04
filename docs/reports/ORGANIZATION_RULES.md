# 📋 Quy Tắc Tổ Chức Tài Liệu - Quick Reference

**Mục đích:** Giữ documentation luôn gọn gàng, chuyên nghiệp, dễ tìm kiếm ✨

---

## 🎯 QUY TẮC VÀNG

### ✅ LUÔN LÀM

1. **Tạo folder riêng cho mỗi tuần NGAY TỪ ĐẦU**
   ```
   docs/reports/week-X/
   ```

2. **Tất cả files của tuần đó PHẢI ở trong folder đó**
   ```
   ✅ ĐÚNG: docs/reports/week-8/WEEK_8_PLAN.md
   ❌ SAI:  docs/reports/WEEK_8_PLAN.md
   ```

3. **Follow naming convention**
   - `WEEK_X_PLAN.md`
   - `WEEK_X_PHASE_Y_PROGRESS.md`
   - `WEEK_X_PHASE_Y_COMPLETION.md`

4. **Cập nhật README.md khi bắt đầu tuần mới**

### ❌ KHÔNG BAO GIỜ

1. ❌ Bỏ files báo cáo ở thư mục gốc (root)
2. ❌ Trộn lẫn files nhiều tuần trong 1 folder
3. ❌ Quên commit khi tạo structure mới

---

## 🚀 WORKFLOW BẮT ĐẦU TUẦN MỚI

### Bước 1: Tạo Folder Tuần Mới
```powershell
# Ví dụ: Bắt đầu Week 8
New-Item -Path "docs/reports/week-8" -ItemType Directory
```

### Bước 2: Tạo File Plan Đầu Tiên
```powershell
New-Item -Path "docs/reports/week-8/WEEK_8_PLAN.md" -ItemType File
```

### Bước 3: Cập Nhật README.md

Thêm vào section "Cấu Trúc Thư Mục":
```markdown
├── week-8/                          # 🚀 Tuần 8 (Hiện Tại)
│   └── WEEK_8_PLAN.md              # Kế hoạch tuần 8
```

Cập nhật "Trạng Thái Hiện Tại":
```markdown
## 🎯 Trạng Thái Hiện Tại (October XX, 2025)

### ✅ Hoàn Thành
- Week 7: Order Management & Payment System (100%)

### 🔄 Đang Làm
- Week 8: [Tên Phase] (X%)
```

### Bước 4: Commit
```powershell
git add docs/reports/
git commit -m "docs: Initialize Week 8 documentation structure"
git push
```

---

## 📁 CẤU TRÚC LÝ TƯỞNG

```
docs/reports/
├── README.md                    # ⭐ Main index (luôn cập nhật)
│
├── archived/                    # 🗄️ Tuần cũ (>2 tuần)
│   ├── week-4-6/
│   └── week-7/
│
├── week-8/                      # 📂 Tuần trước (đã hoàn thành)
│   ├── WEEK_8_PLAN.md
│   ├── WEEK_8_PHASE_1_PROGRESS.md
│   └── WEEK_8_PHASE_1_COMPLETION.md
│
├── week-9/                      # 🚀 Tuần hiện tại
│   ├── WEEK_9_PLAN.md
│   ├── WEEK_9_PHASE_1_PROGRESS.md
│   └── ...
│
├── fixes/                       # 🔧 Bug fixes (permanent)
│   └── [FEATURE]_FIX_*.md
│
└── guides/                      # 📖 Guides (permanent)
    └── [TOPIC]_GUIDE.md
```

---

## 🗂️ NAMING CONVENTIONS

### Weekly Reports
```
WEEK_X_PLAN.md                          # Kế hoạch tổng thể
WEEK_X_DETAILED_PLAN.md                 # Kế hoạch chi tiết
WEEK_X_PROGRESS.md                      # Tiến độ tổng thể
WEEK_X_SUMMARY.md                       # Tóm tắt tuần
WEEK_X_PHASE_Y_PLAN.md                  # Kế hoạch phase
WEEK_X_PHASE_Y_PROGRESS.md              # Tiến độ phase
WEEK_X_PHASE_Y_COMPLETION.md            # Hoàn thành phase
```

### Bug Fixes
```
fixes/LOGIN_FIX_*.md
fixes/RESERVATION_FIX_*.md
fixes/[FEATURE]_FIX_[DESCRIPTION].md
```

### Guides
```
guides/DATABASE_SETUP_COMPLETE.md
guides/[TOPIC]_GUIDE.md
guides/[TOPIC]_TEST_GUIDE.md
```

---

## ♻️ ARCHIVE POLICY

### Khi nào archive?
- ✅ Sau **2 tuần** từ khi hoàn thành
- ✅ Khi có **tuần mới** bắt đầu (Week X+2)

### Ví dụ Timeline:
```
Week 7: Oct 1-7   → Hoàn thành Oct 7
Week 8: Oct 8-14  → Week 7 vẫn active
Week 9: Oct 15-21 → Archive Week 7 (đã 2 tuần)
```

### Cách Archive:
```powershell
# 1. Tạo archived folder (nếu chưa có)
New-Item -Path "docs/reports/archived" -ItemType Directory

# 2. Di chuyển tuần cũ
Move-Item "docs/reports/week-7" "docs/reports/archived/"

# 3. Commit
git add docs/reports/
git commit -m "docs: Archive Week 7 reports"
git push
```

---

## ✅ CHECKLIST TRƯỚC KHI COMMIT

Trước khi commit bất kỳ report nào, check:

- [ ] File có ở đúng folder `week-X/` không?
- [ ] Tên file follow naming convention?
- [ ] README.md đã được cập nhật?
- [ ] Không có file nào ở root của `docs/reports/`?
- [ ] Commit message rõ ràng?

**Example commit messages:**
```
✅ docs: Add Week 8 Phase 1 plan
✅ docs: Update Week 8 Phase 1 progress (Task 1 complete)
✅ docs: Complete Week 8 Phase 1 report
✅ docs: Archive Week 7 reports
✅ docs: Initialize Week 9 documentation structure
```

---

## 📊 QUICK COMMANDS

### Tạo tuần mới (Week X):
```powershell
# All-in-one command
$week = 8
New-Item -Path "docs/reports/week-$week" -ItemType Directory
New-Item -Path "docs/reports/week-$week/WEEK_${week}_PLAN.md" -ItemType File
Write-Host "✅ Week $week structure created!"
```

### Kiểm tra structure:
```powershell
tree /F "docs\reports\" | Select-Object -First 50
```

### Đếm files trong mỗi folder:
```powershell
Get-ChildItem "docs/reports/week-*" | ForEach-Object {
    $count = (Get-ChildItem $_.FullName -File).Count
    Write-Host "$($_.Name): $count files"
}
```

### Archive tuần cũ:
```powershell
# Ví dụ: Archive Week 7
$week = 7
if (-not (Test-Path "docs/reports/archived")) {
    New-Item -Path "docs/reports/archived" -ItemType Directory
}
Move-Item "docs/reports/week-$week" "docs/reports/archived/"
Write-Host "✅ Week $week archived!"
```

---

## 🎨 EXAMPLE: Week 8 Setup

```powershell
# 1. Create folder
New-Item -Path "docs/reports/week-8" -ItemType Directory

# 2. Create initial files
@(
    "WEEK_8_PLAN.md",
    "WEEK_8_PHASE_1_PLAN.md",
    "WEEK_8_PHASE_1_PROGRESS.md"
) | ForEach-Object {
    New-Item -Path "docs/reports/week-8/$_" -ItemType File
}

# 3. Update README.md (manually)

# 4. Commit
git add docs/reports/
git commit -m "docs: Initialize Week 8 documentation structure

- Created week-8/ folder
- Added plan templates
- Updated README.md"
git push
```

---

## 🌟 LỢI ÍCH CỦA HỆ THỐNG NÀY

### ✨ Cho Developer
- Dễ tìm kiếm tài liệu
- Rõ ràng timeline
- Không bị overwhelm bởi quá nhiều files

### ✨ Cho Team
- Professional structure
- Easy onboarding
- Clear progress tracking

### ✨ Cho Maintenance
- Scalable cho tương lai
- Easy to archive old docs
- Clean and organized

---

## 📞 Need Help?

**Nếu bạn:**
- 🤔 Không chắc đặt file ở đâu → Check README.md section "Cấu Trúc Thư Mục"
- 📝 Không biết đặt tên gì → Follow "Naming Conventions" section
- 🗂️ Cần archive tuần cũ → Follow "Archive Policy" section
- 🆕 Bắt đầu tuần mới → Follow "Workflow Bắt Đầu Tuần Mới"

**Main Documentation:** [docs/reports/README.md](./README.md)

---

## 🎯 TÓM TẮT

**3 Điều QUAN TRỌNG NHẤT:**

1. **Mỗi tuần = 1 folder riêng** (`week-X/`)
2. **Tất cả files tuần đó vào folder đó** (không để ngoài)
3. **Cập nhật README.md** mỗi khi có thay đổi

**Làm đúng 3 điều này → Documentation luôn gọn gàng! ✨**

---

**Created:** October 4, 2025  
**Purpose:** Keep documentation organized and professional  
**Applies to:** All future weeks (Week 8+)
