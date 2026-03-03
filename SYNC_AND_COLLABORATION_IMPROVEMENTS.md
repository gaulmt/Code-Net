# Cải tiến Sync và Collaboration - Danh sách yêu cầu

## Trạng thái: Đang thực hiện

## Các yêu cầu cần làm:

### 1. ✅ Bỏ nút "Đã lưu" 
- **Trạng thái**: HOÀN THÀNH
- **Chi tiết**: Đã xóa trạng thái "Đã lưu", chỉ giữ "Đồng bộ" và "Đang đồng bộ..."

### 2. 🔄 Thêm option chọn quyền khi mời vào project
- **Trạng thái**: CẦN LÀM
- **Chi tiết**: 
  - Khi mời bạn bè vào project, cho phép chọn quyền: Viewer (chỉ đọc) hoặc Editor (đọc + ghi)
  - Tránh trường hợp mời nhầm với quyền write và bị phá code
- **File cần sửa**: 
  - `client/src/components/InviteMembersModal.jsx`
  - `client/src/firebase.js` (sendProjectInvite function)

### 3. 🔄 Download file ZIP với cấu trúc thư mục
- **Trạng thái**: CẦN LÀM
- **Chi tiết**:
  - Khi download, tạo file ZIP chứa tất cả files
  - Giữ nguyên cấu trúc thư mục như trên web (nested folders)
  - Sử dụng thư viện JSZip
- **File cần sửa**:
  - `client/src/components/DownloadModal.jsx`
  - `client/src/components/Editor.jsx`

### 4. 🔄 Hệ thống đồng bộ real-time với file locking
- **Trạng thái**: CẦN LÀM - ƯU TIÊN CAO
- **Chi tiết**:
  - Khi A nhấn "Đồng bộ" → File bị lock
  - Tất cả người dùng khác (B, C, D...) thấy trạng thái "Đang đồng bộ"
  - Tất cả người dùng khác không thể code (read-only) cho đến khi sync xong
  - Sau khi sync xong → unlock → mọi người có thể code tiếp
- **Cơ chế**:
  ```
  Firebase: documents/{projectId}/files/{fileName}/
    - content: { text, updatedAt }
    - lock: { 
        isLocked: boolean,
        lockedBy: userId,
        lockedAt: timestamp,
        lockedByName: username
      }
  ```
- **File cần sửa**:
  - `client/src/socket.js` (thêm lock/unlock functions)
  - `client/src/components/Editor.jsx` (listen to lock status)
  - `client/src/firebase.js` (thêm lock management)

### 5. 🔄 Đồng bộ nhiều file cùng lúc
- **Trạng thái**: CẦN LÀM
- **Chi tiết**:
  - Thêm checkbox ở FileManager để chọn nhiều file
  - Nút "Đồng bộ đã chọn" để sync nhiều file cùng lúc
  - Hiển thị progress bar khi sync nhiều file
- **File cần sửa**:
  - `client/src/components/FileManager.jsx`
  - `client/src/components/Editor.jsx`

## Thứ tự ưu tiên thực hiện:

1. **Ưu tiên 1**: Hệ thống file locking (yêu cầu 4) - Quan trọng nhất
2. **Ưu tiên 2**: Thêm option chọn quyền khi mời (yêu cầu 2) - Bảo mật
3. **Ưu tiên 3**: Download ZIP (yêu cầu 3) - Tiện lợi
4. **Ưu tiên 4**: Đồng bộ nhiều file (yêu cầu 5) - Nice to have

## Ghi chú kỹ thuật:

### File Locking System:
```javascript
// Lock file before sync
await lockFile(projectId, fileName, userId, username);

// Sync content
await updateContent(projectId, fileName, content);

// Unlock after sync
await unlockFile(projectId, fileName);

// Listen to lock status
onValue(lockRef, (snapshot) => {
  const lockData = snapshot.val();
  if (lockData?.isLocked && lockData.lockedBy !== currentUserId) {
    // Set editor to read-only
    // Show "User X đang đồng bộ..." message
  }
});
```

### Download ZIP:
```javascript
import JSZip from 'jszip';

const zip = new JSZip();
files.forEach(file => {
  zip.file(file.name, file.content);
});
const blob = await zip.generateAsync({type: 'blob'});
saveAs(blob, `${projectName}.zip`);
```
