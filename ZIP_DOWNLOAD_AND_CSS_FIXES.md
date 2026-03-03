# ZIP Download và CSS Animation Fixes

## Vấn đề đã sửa

### 1. Lỗi ZIP Download
**Vấn đề**: Khi tải ZIP dự án về bị lỗi "saveAs is not a function"
- Packages `jszip` và `file-saver` đã được cài đặt trong package.json
- Dynamic import không hoạt động tốt với file-saver trong Vite

**Giải pháp**:
- Thay đổi từ dynamic import sang static import
- Import trực tiếp ở đầu file: `import JSZip from 'jszip'` và `import { saveAs } from 'file-saver'`
- Loại bỏ async import trong function

**File đã sửa**: `client/src/components/Editor.jsx`

```javascript
// Thêm vào đầu file
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Function đơn giản hơn
const handleDownloadZip = async (selectedFiles) => {
  try {
    const zip = new JSZip();
    
    // Add files with folder structure preserved
    for (const fileName of selectedFiles) {
      await new Promise((resolve) => {
        getFileContent(documentId, fileName, (data) => {
          const fileContent = data?.text || '';
          zip.file(fileName, fileContent); // fileName includes path
          resolve();
        });
      });
    }
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const zipName = projectName ? `${projectName}.zip` : `project-${documentId}.zip`;
    saveAs(blob, zipName);
    
  } catch (error) {
    console.error('Error creating ZIP:', error);
    alert('Lỗi khi tạo file ZIP: ' + error.message);
  }
};
```

**Tính năng**:
- ✅ Tải về file ZIP với đúng cấu trúc thư mục
- ✅ Tên file bao gồm đường dẫn folder (VD: "src/App.jsx")
- ✅ ZIP file được đặt tên theo tên project

### 2. Lỗi CSS Animation - Notification Dropdown
**Vấn đề**: Dropdown thông báo có hiệu ứng trượt xuống lệch sang trái rồi quay về vị trí đúng

**Nguyên nhân**: Animation `slideDown` sử dụng `translateY` gây ra layout shift

**Giải pháp**:
- Loại bỏ `translateY` animation
- Chỉ sử dụng `opacity` fade in/out
- Thay đổi `will-change` từ `transform, opacity` thành chỉ `opacity`

**File đã sửa**: `client/src/components/NotificationBell.css`

```css
.notification-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  will-change: opacity;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### 3. Lỗi CSS Animation - Sync Dropdown
**Vấn đề**: Dropdown chọn file đồng bộ cũng có hiệu ứng trượt xuống lệch

**Giải pháp**: Tương tự notification dropdown

**File đã sửa**: `client/src/components/Editor.css`

```css
.sync-modal-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: #252526;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 300px;
  will-change: opacity;
  animation: fadeInDropdown 0.2s ease-out;
}

@keyframes fadeInDropdown {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### 4. Warning "Maximum update depth exceeded" - Sidebar
**Vấn đề**: React warning về việc setState trong useEffect gây ra infinite loop

**Nguyên nhân**: 
- `joinDocument` được gọi mỗi lần `user` object thay đổi reference
- Callback `onChatUpdate` trigger `setMessages` → re-render → `user` object mới → gọi lại `joinDocument`

**Giải pháp**:
- Thêm `hasJoinedRef` để track trạng thái đã join
- Chỉ join một lần khi component mount
- Dependency array chỉ theo dõi `user?.id` thay vì toàn bộ `user` object

**File đã sửa**: `client/src/components/Sidebar.jsx`

```javascript
const hasJoinedRef = useRef(false);

useEffect(() => {
  if (!user || !documentId || hasJoinedRef.current) return;

  hasJoinedRef.current = true;
  
  joinDocument(documentId, user, {
    onChatUpdate: (msgs) => {
      setMessages(msgs);
    }
  });

  return () => {
    hasJoinedRef.current = false;
  };
}, [documentId, user?.id]); // Only re-join if documentId or user.id changes
```

## Kết quả

✅ **ZIP Download**: Hoạt động bình thường, tải về đúng cấu trúc thư mục
✅ **Notification Dropdown**: Animation mượt mà, không bị lệch
✅ **Sync Dropdown**: Animation mượt mà, không bị lệch
✅ **Landing Page**: Notification bell cũng được fix (dùng chung CSS)
✅ **Sidebar Warning**: Không còn warning "Maximum update depth exceeded"

## Cách test

1. **Test ZIP Download**:
   - Mở Editor
   - Click nút "Download"
   - Chọn "Tải về ZIP"
   - Chọn files cần tải
   - Click "Tải ZIP"
   - Kiểm tra file ZIP đã tải về có đúng cấu trúc thư mục

2. **Test Notification Animation**:
   - Click vào icon chuông thông báo
   - Kiểm tra dropdown xuất hiện mượt mà, không lệch
   - Test ở cả Editor và Landing page

3. **Test Sync Dropdown Animation**:
   - Click vào nút mũi tên xuống (▼) bên cạnh nút "Đồng bộ"
   - Kiểm tra dropdown xuất hiện mượt mà, không lệch

4. **Test Sidebar**:
   - Mở chat sidebar
   - Kiểm tra console không còn warning
   - Chat hoạt động bình thường

## Files đã thay đổi

1. `client/src/components/Editor.jsx` - Fix ZIP download import
2. `client/src/components/NotificationBell.css` - Fix notification animation
3. `client/src/components/Editor.css` - Fix sync dropdown animation
4. `client/src/components/Sidebar.jsx` - Fix infinite loop warning

## Ghi chú

- Packages `jszip` và `file-saver` đã có sẵn trong `client/package.json`
- Không cần cài đặt thêm gì
- Chỉ cần reload lại trang để áp dụng thay đổi
