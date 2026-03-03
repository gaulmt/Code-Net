# 🌐 Kế Hoạch Tính Năng Social - Code Net

## 📋 TỔNG QUAN

### Các Tính Năng Cần Phát Triển:

1. **Hệ Thống Kết Bạn (Friend System)**
   - Gửi lời mời kết bạn
   - Nhận thông báo kết bạn
   - Chấp nhận/Từ chối lời mời
   - Danh sách bạn bè

2. **Hệ Thống Thông Báo (Notification System)**
   - Icon thông báo trên navigation bar
   - Badge số lượng thông báo chưa đọc
   - Dropdown xem danh sách thông báo
   - Các loại thông báo:
     - Lời mời kết bạn
     - Lời mời vào project
     - Tin nhắn mới
     - Hoạt động của bạn bè

3. **Mời Bạn Bè Vào Project**
   - Nút "Mời bạn bè" trong giao diện code
   - Modal chọn bạn bè để mời
   - Gửi thông báo mời project
   - Người nhận thấy thông báo và có thể tham gia

4. **Global Chat Room (Box Chat Cộng Đồng)**
   - Box chat duy nhất cho tất cả users
   - Gửi tin nhắn, emoji, icon
   - Xem profile nhanh (hover/click)
   - Kết bạn trực tiếp từ chat
   - Real-time với Firebase

## 🗂️ CẤU TRÚC DATABASE

### Firebase Realtime Database Structure:

```
code-together-cfbfa/
├── users/
│   └── {userId}/
│       ├── profile/
│       ├── friends/
│       │   └── {friendId}/
│       │       ├── status: "pending" | "accepted" | "rejected"
│       │       ├── requestedBy: userId
│       │       ├── requestedAt: timestamp
│       │       └── acceptedAt: timestamp
│       └── notifications/
│           └── {notificationId}/
│               ├── type: "friend_request" | "project_invite" | "message"
│               ├── from: userId
│               ├── fromName: string
│               ├── fromAvatar: url
│               ├── message: string
│               ├── data: object
│               ├── read: boolean
│               ├── createdAt: timestamp
│               └── actionUrl: string (optional)
│
├── friendRequests/
│   └── {requestId}/
│       ├── from: userId
│       ├── to: userId
│       ├── status: "pending" | "accepted" | "rejected"
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── projectInvites/
│   └── {inviteId}/
│       ├── projectId: string
│       ├── projectName: string
│       ├── from: userId
│       ├── fromName: string
│       ├── to: userId
│       ├── status: "pending" | "accepted" | "rejected"
│       └── createdAt: timestamp
│
└── globalChat/
    └── messages/
        └── {messageId}/
            ├── userId: string
            ├── username: string
            ├── avatar: url
            ├── message: string
            ├── type: "text" | "emoji" | "system"
            ├── timestamp: number
            └── reactions: object
```

## 📁 CẤU TRÚC FILES MỚI

### Components:
```
client/src/components/
├── NotificationBell.jsx          # Icon thông báo + dropdown
├── NotificationBell.css
├── NotificationItem.jsx           # Item trong danh sách thông báo
├── FriendRequestModal.jsx         # Modal gửi lời mời kết bạn
├── FriendRequestModal.css
├── FriendsList.jsx                # Danh sách bạn bè
├── FriendsList.css
├── ProjectInviteModal.jsx         # Modal mời bạn vào project
├── ProjectInviteModal.css
├── GlobalChat.jsx                 # Box chat cộng đồng
├── GlobalChat.css
├── UserProfileCard.jsx            # Card xem nhanh profile
└── UserProfileCard.css
```

### Firebase Functions:
```
client/src/firebase.js (thêm):
├── sendFriendRequest()
├── acceptFriendRequest()
├── rejectFriendRequest()
├── getFriendRequests()
├── getFriends()
├── removeFriend()
├── sendProjectInvite()
├── acceptProjectInvite()
├── getNotifications()
├── markNotificationAsRead()
├── sendGlobalChatMessage()
├── getGlobalChatMessages()
└── subscribeToGlobalChat()
```

## 🎨 UI/UX DESIGN

### 1. Navigation Bar (Thêm Icons)
```
[Logo] [Projects] [Friends] [Notifications🔔(3)] [Messages] [Avatar▼]
```

### 2. Notification Dropdown
```
┌─────────────────────────────────────┐
│ 🔔 Thông báo (3)                    │
├─────────────────────────────────────┤
│ 👤 John Doe gửi lời mời kết bạn    │
│    [Chấp nhận] [Từ chối]      2 phút│
├─────────────────────────────────────┤
│ 📁 Alice mời bạn vào "My Project"  │
│    [Tham gia] [Bỏ qua]        5 phút│
├─────────────────────────────────────┤
│ 💬 Bob đã nhắn tin cho bạn         │
│    [Xem tin nhắn]            10 phút│
├─────────────────────────────────────┤
│ [Xem tất cả]                        │
└─────────────────────────────────────┘
```

### 3. Friends Modal (Trong Editor)
```
┌─────────────────────────────────────┐
│ 👥 Bạn bè                      [X]  │
├─────────────────────────────────────┤
│ [Tìm kiếm bạn bè...]               │
├─────────────────────────────────────┤
│ 🟢 John Doe                         │
│    Online • Developer               │
│    [Nhắn tin] [Mời vào project]    │
├─────────────────────────────────────┤
│ ⚪ Alice Smith                      │
│    Offline • Designer               │
│    [Nhắn tin] [Mời vào project]    │
└─────────────────────────────────────┘
```

### 4. Global Chat Box
```
┌─────────────────────────────────────┐
│ 🌐 Chat Cộng Đồng          [−][X]  │
├─────────────────────────────────────┤
│ 👤 John: Hello everyone! 👋        │
│ 👤 Alice: Hi John!                 │
│ 👤 Bob: Anyone working on React?   │
│ 👤 You: Yes, I am! 🚀              │
├─────────────────────────────────────┤
│ [😊] [Aa...] [Gửi]                 │
└─────────────────────────────────────┘
```

### 5. User Profile Card (Hover/Click)
```
┌─────────────────────────────────────┐
│        [Avatar]                     │
│      John Doe ✓                     │
│      @johndoe                       │
├─────────────────────────────────────┤
│ 📊 50 projects • 120 friends       │
│ 🏆 Top Contributor                 │
├─────────────────────────────────────┤
│ [👤 Kết bạn] [💬 Nhắn tin]         │
└─────────────────────────────────────┘
```

## 🔧 IMPLEMENTATION PLAN

### Phase 1: Hệ Thống Thông Báo (1-2 ngày)
- [ ] Tạo NotificationBell component
- [ ] Firebase functions cho notifications
- [ ] Real-time listener
- [ ] Badge số lượng chưa đọc
- [ ] Dropdown UI

### Phase 2: Hệ Thống Kết Bạn (2-3 ngày)
- [ ] Friend request functions
- [ ] FriendRequestModal component
- [ ] FriendsList component
- [ ] Accept/Reject actions
- [ ] Thông báo kết bạn

### Phase 3: Mời Vào Project (1-2 ngày)
- [ ] ProjectInviteModal component
- [ ] Invite functions
- [ ] Thông báo mời project
- [ ] Join project từ notification

### Phase 4: Global Chat (2-3 ngày)
- [ ] GlobalChat component
- [ ] Real-time messaging
- [ ] Emoji picker
- [ ] User profile card
- [ ] Kết bạn từ chat

### Phase 5: Integration & Polish (1-2 ngày)
- [ ] Tích hợp tất cả vào Editor
- [ ] Navigation bar updates
- [ ] Testing
- [ ] Bug fixes
- [ ] UI/UX improvements

## 🎯 PRIORITY

### Must Have (P0):
1. Hệ thống thông báo cơ bản
2. Kết bạn (gửi/nhận/chấp nhận)
3. Mời vào project

### Should Have (P1):
4. Global chat
5. User profile card
6. Emoji/reactions

### Nice to Have (P2):
7. Friend suggestions
8. Activity feed
9. Online status
10. Typing indicators

## 🔐 FIREBASE RULES CẦN CẬP NHẬT

```json
{
  "rules": {
    "friendRequests": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "projectInvites": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "globalChat": {
      "messages": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "users": {
      "$userId": {
        "notifications": {
          ".read": "auth != null && auth.uid == $userId",
          ".write": "auth != null"
        },
        "friends": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    }
  }
}
```

## 📊 ESTIMATED TIME

- **Phase 1:** 1-2 ngày
- **Phase 2:** 2-3 ngày
- **Phase 3:** 1-2 ngày
- **Phase 4:** 2-3 ngày
- **Phase 5:** 1-2 ngày

**Total:** 7-12 ngày (1-2 tuần)

## 🚀 NEXT STEPS

1. Bắt đầu với Phase 1: Notification System
2. Tạo NotificationBell component
3. Implement Firebase functions
4. Test real-time updates
5. Move to Phase 2

---

**Bạn muốn bắt đầu với tính năng nào trước?**
- Thông báo (Notification Bell)
- Kết bạn (Friend System)
- Mời vào project
- Global Chat

Hoặc tôi có thể implement tất cả theo thứ tự ưu tiên?
