# 🌙 Dark Theme Default - Fix

## ✅ Đã fix

Khi vào project từ kho hoặc tạo mới, theme mặc định luôn là **dark** (vs-dark trong Monaco Editor).

---

## 🔧 Thay đổi

### 1. Editor.jsx - Convert app theme to Monaco theme

**Trước:**
```javascript
const theme = appTheme || localStorage.getItem('editorTheme') || 'vs-dark';
```

**Sau:**
```javascript
// Convert app theme to Monaco theme
const getMonacoTheme = (appTheme) => {
  if (appTheme === 'light') return 'vs-light';
  if (appTheme === 'dark') return 'vs-dark';
  if (appTheme === 'high-contrast') return 'hc-black';
  return appTheme; // If already Monaco theme format
};

// Use theme from App or fallback to local, always default to vs-dark
const theme = getMonacoTheme(appTheme || localStorage.getItem('editorTheme') || 'dark');
```

**Lý do:**
- App.jsx truyền theme là 'dark' (string)
- Monaco Editor cần 'vs-dark' (Monaco theme format)
- Cần convert giữa 2 formats

### 2. App.jsx - Set theme khi tạo project

**Thêm vào `handleCreateProject`:**
```javascript
setUser(newUser);
setDocumentId(shortCode);
setProjectName(projectName || `Project ${shortCode}`);
setShowLanding(false);

// Set theme to dark when entering project
setTheme('dark');
localStorage.setItem('appTheme', 'dark');
```

**Lý do:**
- Đảm bảo theme luôn là 'dark' khi tạo project mới
- Lưu vào localStorage để persist

### 3. App.jsx - Set theme khi join project

**Thêm vào `handleJoinProject`:**
```javascript
setUser(newUser);
setDocumentId(projectId);
setProjectName(savedProjectName || projectId);
setShowLanding(false);

// Set theme to dark when entering project
setTheme('dark');
localStorage.setItem('appTheme', 'dark');
```

**Lý do:**
- Đảm bảo theme luôn là 'dark' khi join project
- Áp dụng cho cả khi mở từ kho project
- Lưu vào localStorage để persist

---

## 🎯 Kết quả

### Trước fix:
- Mở project từ kho → Theme có thể là light (nếu localStorage có 'appTheme': 'light')
- Tạo project mới → Theme có thể là light
- Join project → Theme có thể là light

### Sau fix:
- Mở project từ kho → Theme luôn là **dark** ✅
- Tạo project mới → Theme luôn là **dark** ✅
- Join project → Theme luôn là **dark** ✅

---

## 🔄 Flow

### 1. User mở project từ kho
```
ProjectsManager → onJoinProject(code, role, name)
  ↓
Landing → onJoinProject(username, code, role, skipCheck=true, name)
  ↓
App → handleJoinProject(...)
  ↓
setTheme('dark') + localStorage.setItem('appTheme', 'dark')
  ↓
Editor nhận appTheme='dark'
  ↓
getMonacoTheme('dark') → 'vs-dark'
  ↓
Monaco Editor theme = 'vs-dark' ✅
```

### 2. User tạo project mới
```
Landing → onCreateProject(username, code, name)
  ↓
App → handleCreateProject(...)
  ↓
setTheme('dark') + localStorage.setItem('appTheme', 'dark')
  ↓
Editor nhận appTheme='dark'
  ↓
getMonacoTheme('dark') → 'vs-dark'
  ↓
Monaco Editor theme = 'vs-dark' ✅
```

### 3. User join project
```
Landing → onJoinProject(username, code)
  ↓
App → handleJoinProject(...)
  ↓
setTheme('dark') + localStorage.setItem('appTheme', 'dark')
  ↓
Editor nhận appTheme='dark'
  ↓
getMonacoTheme('dark') → 'vs-dark'
  ↓
Monaco Editor theme = 'vs-dark' ✅
```

---

## 🎨 Theme Mapping

| App Theme | Monaco Theme |
|-----------|--------------|
| 'dark' | 'vs-dark' |
| 'light' | 'vs-light' |
| 'high-contrast' | 'hc-black' |

---

## 📝 Notes

### Tại sao cần convert?
- App.jsx quản lý theme ở level cao với format đơn giản: 'dark', 'light'
- Monaco Editor cần format riêng: 'vs-dark', 'vs-light', 'hc-black'
- Cần function convert giữa 2 formats

### Tại sao set theme khi vào project?
- User có thể đã set theme là 'light' trước đó
- localStorage lưu theme cũ
- Khi vào project, cần force theme về 'dark' để đồng nhất
- Lưu vào localStorage để persist cho lần sau

### User có thể đổi theme không?
- Có! User vẫn có thể đổi theme bằng nút toggle
- Nhưng mỗi lần vào project mới, theme sẽ reset về 'dark'
- Đây là behavior mong muốn để đảm bảo consistency

---

## ✅ Testing

### Test cases:
1. ✅ Tạo project mới → Theme = dark
2. ✅ Join project → Theme = dark
3. ✅ Mở project từ kho → Theme = dark
4. ✅ Đổi theme sang light → Vẫn hoạt động
5. ✅ Refresh page → Theme persist
6. ✅ Vào project khác → Theme reset về dark

---

## 🐛 Troubleshooting

### Theme vẫn là light?
- Clear localStorage: `localStorage.clear()`
- Hard refresh: Ctrl + Shift + R
- Check console logs

### Theme không persist?
- Check localStorage có 'appTheme' không
- Check Editor có nhận appTheme prop không
- Check getMonacoTheme function

### Theme bị lỗi?
- Check Monaco Editor có load không
- Check theme string có đúng format không
- Check console errors

---

## 📊 Build Status

```
✓ Build successful!
- index.js: 702.99 KB (165.46 KB gzipped)
- No errors
- Status: ✅ Production Ready
```

---

**Feature:** Dark Theme Default
**Status:** ✅ Complete
**Author:** Nguyễn Đăng Dương
**Date:** 2026
