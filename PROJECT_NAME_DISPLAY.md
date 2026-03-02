# 📁 Hiển thị tên Project trong Editor

## Tổng quan
Thêm hiển thị tên project ở thanh công cụ Editor, bên cạnh nút Download.

## Vị trí
```
┌─────────────────────────────────────────────────────────────┐
│ 📁 My Project / main.js    Download  Theme  Hiện cursor    │
│ ↑              ↑                                             │
│ Project Name   Current File                                 │
└─────────────────────────────────────────────────────────────┘
```

## Thiết kế

### Layout
```
[📁 Project Name] / [current-file.js] | [Download] [Theme] [Cursor]
     ↑                    ↑                      ↑
  Highlight          Normal text            Controls
```

### Màu sắc
- **Project Name**: 
  - Text: #4ECDC4 (xanh lá)
  - Background: rgba(78, 205, 196, 0.1) (xanh nhạt)
  - Border: rgba(78, 205, 196, 0.3)
  - Icon: 📁 (folder emoji)

- **Separator**: 
  - Text: #666 (xám)
  - Character: `/`

- **Current File**: 
  - Text: #d4d4d4 (trắng xám)
  - Font: monospace

## CSS Styles

### Project Name
```css
.project-name {
  color: #4ECDC4;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  padding: 0.25rem 0.75rem;
  background: rgba(78, 205, 196, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(78, 205, 196, 0.3);
}

.project-name::before {
  content: '📁 ';
  margin-right: 0.25rem;
}
```

### Separator
```css
.separator {
  color: #666;
  font-size: 1rem;
  user-select: none;
}
```

### Current File
```css
.current-file {
  color: #d4d4d4;
  font-size: 0.9rem;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

## JSX Structure

```jsx
<div className="editor-header">
  <div className="editor-header-left">
    {projectName && (
      <>
        <span className="project-name">{projectName}</span>
        <span className="separator">/</span>
      </>
    )}
    <span className="current-file">{currentFile}</span>
  </div>
  
  <div className="editor-controls">
    <button className="download-btn">...</button>
    <button className="theme-btn">...</button>
    {/* ... */}
  </div>
</div>
```

## Props Flow

### App.jsx → Editor
```javascript
// App.jsx
const [projectName, setProjectName] = useState('');

const handleCreateProject = (username, projectId, projectName) => {
  setProjectName(projectName || `Project ${shortCode}`);
  // ...
};

const handleJoinProject = async (username, projectId, savedRole, skipCheck, savedProjectName) => {
  // ...
  setProjectName(savedProjectName || projectId); // Use saved name or fallback
  // ...
};

// Render
<Editor 
  documentId={documentId} 
  projectName={projectName}  // ← Pass project name
  user={user} 
  users={users} 
  currentFile={currentFile} 
  theme={theme} 
  onThemeChange={setTheme} 
/>
```

### ProjectsManager → Landing → App
```javascript
// ProjectsManager.jsx
const handleJoin = (project) => {
  onJoinProject(project.code, project.role, project.name); // ← Pass name
  onClose();
};

// Landing.jsx
<ProjectsManager
  onJoinProject={(code, savedRole, projectName) => {
    onJoinProject(displayName, code, savedRole, true, projectName); // ← Forward name
  }}
/>

// App.jsx receives savedProjectName parameter
```

### Editor.jsx
```javascript
function Editor({ documentId, projectName, user, users, currentFile, theme, onThemeChange }) {
  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-header-left">
          {projectName && (
            <>
              <span className="project-name">{projectName}</span>
              <span className="separator">/</span>
            </>
          )}
          <span className="current-file">{currentFile}</span>
        </div>
        {/* ... */}
      </div>
    </div>
  );
}
```

## Responsive Behavior

### Overflow Handling
```css
.project-name {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

Nếu tên project quá dài:
```
📁 My Very Long Project Na... / main.js
```

### Flex Layout
```css
.editor-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}
```

## Visual Examples

### Example 1: Short name
```
┌────────────────────────────────────────┐
│ 📁 Todo App / index.html   Download   │
└────────────────────────────────────────┘
```

### Example 2: Long name
```
┌────────────────────────────────────────┐
│ 📁 My Awesome Project... / main.js    │
└────────────────────────────────────────┘
```

### Example 3: No project name (fallback)
```
┌────────────────────────────────────────┐
│ main.js   Download   Theme            │
└────────────────────────────────────────┘
```

### Example 4: File in folder
```
┌────────────────────────────────────────┐
│ 📁 Website / src/app.js   Download    │
└────────────────────────────────────────┘
```

## Features

### 1. Visual Hierarchy
- Project name nổi bật với background và border
- Icon 📁 giúp nhận diện nhanh
- Separator `/` tách biệt rõ ràng

### 2. Truncation
- Project name max 250px
- Text overflow với ellipsis (...)
- Current file cũng có ellipsis

### 3. Conditional Rendering
```javascript
{projectName && (
  <>
    <span className="project-name">{projectName}</span>
    <span className="separator">/</span>
  </>
)}
```
Chỉ hiển thị khi có projectName.

### 4. Accessibility
- Semantic HTML (span elements)
- Clear visual contrast
- Readable font sizes

## Files Modified

1. ✅ `client/src/components/Editor.jsx`
   - Add separator between project name and file name
   - Conditional rendering with fragment

2. ✅ `client/src/components/Editor.css`
   - Enhanced .project-name styles
   - Add .separator styles
   - Improve visual hierarchy

3. ✅ `client/src/components/ProjectsManager.jsx`
   - Pass project.name to onJoinProject callback

4. ✅ `client/src/components/Landing.jsx`
   - Forward projectName from ProjectsManager to App

5. ✅ `client/src/App.jsx`
   - Add savedProjectName parameter to handleJoinProject
   - Set projectName when joining from saved projects

6. ✅ `PROJECT_NAME_DISPLAY.md` (this file)
   - Documentation

## Testing Checklist

- [ ] Project name hiển thị khi tạo project mới
- [ ] Project name hiển thị khi join project
- [ ] **Project name hiển thị khi mở từ kho Projects**
- [ ] Separator `/` xuất hiện giữa project và file
- [ ] Icon 📁 hiển thị
- [ ] Background và border đẹp
- [ ] Truncation hoạt động với tên dài
- [ ] Không hiển thị khi không có projectName
- [ ] Responsive trên màn hình nhỏ
- [ ] Không che nút Download
- [ ] **Tên project đúng với tên đã lưu trong kho**

## Benefits

1. **Context Awareness**: User luôn biết đang làm project nào
2. **Visual Clarity**: Dễ phân biệt project name vs file name
3. **Professional Look**: UI chuyên nghiệp hơn
4. **Navigation**: Dễ dàng nhận diện workspace

## Future Enhancements

1. **Click to copy**: Click project name để copy
2. **Breadcrumb**: Hiển thị full path cho nested folders
3. **Tooltip**: Hover để xem full project name
4. **Project icon**: Custom icon cho từng project type
5. **Color coding**: Màu khác nhau cho project types

## Kết luận

Tên project giờ hiển thị rõ ràng ở thanh công cụ với:
- ✅ Visual hierarchy tốt
- ✅ Icon và màu sắc nổi bật
- ✅ Separator rõ ràng
- ✅ Responsive và truncation
- ✅ Professional appearance
