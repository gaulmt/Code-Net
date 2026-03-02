# ✏️ Tính năng Rename File

## Tổng quan
Thêm khả năng đổi tên file trực tiếp trong FileManager, bao gồm cả extension.

## Tính năng

### 1. Rename file với full path
- Đổi tên file bao gồm cả extension
- Ví dụ: `main.js` → `app.py` (đổi cả tên và extension)
- Ví dụ: `index.html` → `home.html` (chỉ đổi tên)

### 2. Rename file trong folder
- Giữ nguyên folder path
- Ví dụ: `src/main.js` → `src/app.js`
- Folder path không thay đổi

### 3. UI/UX
- Nút rename (icon bút) xuất hiện khi hover vào file
- Click nút → Input field thay thế tên file
- Enter để confirm, Escape để cancel
- Blur (click ra ngoài) cũng confirm
- Không thể drag file khi đang rename

## Cách sử dụng

### Bước 1: Hover vào file
```
┌─────────────────────────────┐
│ 📄 main.js          ✏️ 🗑️  │ ← Hover để thấy nút
└─────────────────────────────┘
```

### Bước 2: Click nút rename (✏️)
```
┌─────────────────────────────┐
│ 📄 [main.js____]    ✏️ 🗑️  │ ← Input field xuất hiện
└─────────────────────────────┘
```

### Bước 3: Nhập tên mới
```
┌─────────────────────────────┐
│ 📄 [app.py_____]    ✏️ 🗑️  │ ← Đổi cả extension
└─────────────────────────────┘
```

### Bước 4: Enter hoặc click ra ngoài
```
┌─────────────────────────────┐
│ 📄 app.py           ✏️ 🗑️  │ ← File đã được rename
└─────────────────────────────┘
```

## Các trường hợp

### Case 1: Đổi tên giữ extension
```
Input: main.js
Rename to: app.js
Result: app.js ✓
```

### Case 2: Đổi cả extension
```
Input: main.js
Rename to: app.py
Result: app.py ✓
```

### Case 3: File trong folder
```
Input: src/main.js
Rename to: app.py
Result: src/app.py ✓ (giữ folder path)
```

### Case 4: Tên trùng
```
Input: main.js
Rename to: main.js
Result: Không thay đổi (cancel)
```

### Case 5: Tên rỗng
```
Input: main.js
Rename to: [empty]
Result: Không thay đổi (cancel)
```

### Case 6: Đang mở file
```
Input: main.js (đang mở trong editor)
Rename to: app.py
Result: 
  - File được rename thành app.py
  - Editor tự động switch sang app.py
  - Không mất nội dung
```

## Implementation Details

### Logic Flow
```javascript
1. User clicks rename button
   → setRenamingFile(file.name)
   → setRenameValue(file.displayName)
   → Input field appears with autoFocus

2. User types new name
   → renameValue updates

3. User presses Enter or clicks outside
   → handleRename(oldFileName)
   → Get file content
   → uploadFile(newPath, content)
   → deleteFile(oldPath)
   → If current file, switch to new path
   → Clear rename state

4. User presses Escape
   → cancelRename()
   → Clear rename state
```

### State Management
```javascript
const [renamingFile, setRenamingFile] = useState(null);
const [renameValue, setRenameValue] = useState('');
```

### Key Functions

#### startRename
```javascript
const startRename = (file, e) => {
  e.stopPropagation();
  setRenamingFile(file.name);
  setRenameValue(file.displayName);
};
```

#### handleRename
```javascript
const handleRename = (oldFileName) => {
  // Validate
  if (!renameValue.trim() || renameValue === oldFileName) {
    setRenamingFile(null);
    return;
  }

  // Build new path
  const parts = oldFileName.split('/');
  const newFullPath = parts.length > 1 
    ? `${parts[0]}/${newName}` 
    : newName;

  // Get content and recreate file
  const file = files.find(f => f.name === oldFileName);
  uploadFile(documentId, newFullPath, file.content?.text || '');
  
  // Delete old file
  setTimeout(() => deleteFile(documentId, oldFileName), 100);
  
  // Switch editor if needed
  if (oldFileName === currentFile) {
    setTimeout(() => onFileSelect(newFullPath), 150);
  }
};
```

#### cancelRename
```javascript
const cancelRename = () => {
  setRenamingFile(null);
  setRenameValue('');
};
```

### UI Components

#### Rename Input
```jsx
{renamingFile === file.name ? (
  <input
    type="text"
    className="rename-input"
    value={renameValue}
    onChange={(e) => setRenameValue(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') handleRename(file.name);
      else if (e.key === 'Escape') cancelRename();
    }}
    onBlur={() => handleRename(file.name)}
    autoFocus
    onClick={(e) => e.stopPropagation()}
  />
) : (
  <span className="file-name">{file.displayName}</span>
)}
```

#### Rename Button
```jsx
<button
  className="rename-btn"
  onClick={(e) => startRename(file, e)}
  title="Đổi tên file"
>
  <FiEdit2 />
</button>
```

### CSS Styles

#### Rename Input
```css
.rename-input {
  flex: 1;
  background: #3c3c3c;
  border: 1px solid #667eea;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.85rem;
  outline: none;
}

.rename-input:focus {
  border-color: #4ECDC4;
  box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
}
```

#### Rename Button
```css
.rename-btn {
  background: transparent;
  border: none;
  color: #4ECDC4;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  border-radius: 3px;
}

.rename-btn:hover {
  background: #2d2d30;
  color: #5fd9cf;
}
```

#### File Actions Container
```css
.file-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .file-actions {
  opacity: 1;
}
```

## Keyboard Shortcuts

- **Enter**: Confirm rename
- **Escape**: Cancel rename
- **Click outside**: Confirm rename (blur event)

## Edge Cases Handled

### 1. Empty name
```javascript
if (!renameValue.trim()) {
  setRenamingFile(null);
  return;
}
```

### 2. Same name
```javascript
if (renameValue === oldFileName) {
  setRenamingFile(null);
  return;
}
```

### 3. File in folder
```javascript
const parts = oldFileName.split('/');
const newFullPath = parts.length > 1 
  ? `${parts[0]}/${newName}` 
  : newName;
```

### 4. Current file open
```javascript
if (oldFileName === currentFile) {
  setTimeout(() => onFileSelect(newFullPath), 150);
}
```

### 5. Prevent drag while renaming
```jsx
draggable={renamingFile !== file.name}
onClick={() => renamingFile !== file.name && handleFileClick(file.name)}
```

## Files Modified

1. ✅ `client/src/components/FileManager.jsx`
   - Import FiEdit2 icon
   - Add rename state
   - Add startRename, handleRename, cancelRename functions
   - Update root file rendering
   - Update nested file rendering

2. ✅ `client/src/components/FileManager.css`
   - Add .rename-input styles
   - Add .rename-btn styles
   - Update .file-actions styles
   - Add .file-item.renaming styles

3. ✅ `RENAME_FILE_FEATURE.md` (this file)
   - Documentation

## Testing Checklist

- [ ] Rename root file (main.js → app.js)
- [ ] Rename with extension change (main.js → app.py)
- [ ] Rename file in folder (src/main.js → src/app.js)
- [ ] Rename currently open file (editor switches)
- [ ] Cancel with Escape key
- [ ] Cancel with empty name
- [ ] Cancel with same name
- [ ] Confirm with Enter key
- [ ] Confirm with blur (click outside)
- [ ] Hover shows rename button
- [ ] Cannot drag while renaming
- [ ] Multiple files can be renamed sequentially

## Future Enhancements

1. **Rename folder**: Đổi tên cả folder và update paths của tất cả files bên trong
2. **Validation**: Check tên file hợp lệ (không có ký tự đặc biệt)
3. **Duplicate check**: Cảnh báo nếu tên file đã tồn tại
4. **Undo/Redo**: Có thể undo rename
5. **Batch rename**: Đổi tên nhiều files cùng lúc

## Kết luận

Tính năng rename file đã hoàn chỉnh với:
- ✅ UI/UX mượt mà
- ✅ Đổi được cả extension
- ✅ Hỗ trợ file trong folder
- ✅ Auto-switch editor khi rename file đang mở
- ✅ Keyboard shortcuts
- ✅ Edge cases handled
