# 🌐 Tính năng Cộng đồng (Community) - Mạng xã hội cho Developers

## Tổng quan
Một mạng xã hội hoàn chỉnh tích hợp trong Code Net, nơi developers có thể kết nối, chia sẻ code, và trao đổi kiến thức.

## Tính năng chính

### 1. 📝 Feed/Timeline
- Bảng tin hiển thị tất cả bài viết
- Real-time updates
- Infinite scroll
- Sort by newest

### 2. ✍️ Tạo bài viết (Posts)
- Text content
- Code snippets với syntax highlighting
- Chọn ngôn ngữ lập trình
- Preview trước khi đăng

### 3. ❤️ Tương tác (Interactions)
- **Like**: Thích bài viết
- **Comment**: Bình luận
- **Share**: Chia sẻ
- **Bookmark**: Lưu bài viết

### 4. 💬 Bình luận (Comments)
- Comment trên bài viết
- Nested comments
- Real-time updates
- Avatar và timestamp

### 5. 👥 Follow System
- Follow/Unfollow users
- Xem danh sách following
- Quick follow từ bài viết

### 6. 🔥 Trending
- Bài viết hot nhất
- Dựa trên likes + comments
- Trong 7 ngày gần nhất

### 7. 🔍 Search
- Tìm kiếm users
- Theo username
- Hiển thị số followers

### 8. 📊 Stats
- Số lượt thích
- Số bình luận
- Số lượt xem
- Thời gian đăng

## Thiết kế UI

### Màu sắc (Đen - Tím)
```css
Primary: #667eea (Tím)
Secondary: #764ba2 (Tím đậm)
Background: #1a0a2e (Đen tím)
Background Alt: #16213e (Xanh đen)
Text: #fff (Trắng)
Text Secondary: #b8b8d1 (Xám tím)
Accent: #4ECDC4 (Xanh lá)
Like: #ff6b9d (Hồng)
```

### Gradient
```css
background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
background: linear-gradient(135deg, #1a0a2e 0%, #16213e 100%);
```

## Components

### Community.jsx
Main component chứa toàn bộ logic:
- State management
- API calls
- Rendering

### PostCard
Component hiển thị một bài viết:
- Header (avatar, username, time, follow button)
- Content (text + code)
- Stats (likes, comments, views)
- Interactions (like, comment, share, bookmark)
- Comments section

### CreatePostModal
Modal tạo bài viết mới:
- Text input
- Code input với language selector
- Preview
- Submit button

## Firebase Structure

```
/community
  /posts
    /{postId}
      userId: "..."
      username: "..."
      avatar: "..."
      content: "..."
      code: "..."
      language: "javascript"
      likes: ["userId1", "userId2"]
      comments: [
        {
          userId: "..."
          username: "..."
          avatar: "..."
          text: "..."
          timestamp: 123456789
        }
      ]
      views: 0
      createdAt: 123456789

/users
  /{userId}
    /following
      /{followingId}
        followedAt: 123456789
    /followers
      /{followerId}
        followedAt: 123456789
```

## API Functions

### Posts
```javascript
getCommunityPosts() // Get all posts
createPost(userId, username, postData) // Create new post
likePost(postId, userId) // Like/unlike post
commentOnPost(postId, userId, username, text) // Add comment
getTrendingPosts() // Get trending posts
```

### Users
```javascript
followUser(followerId, followingId) // Follow user
unfollowUser(followerId, followingId) // Unfollow user
getFollowing(userId) // Get following list
searchUsers(query) // Search users by username
```

## Cách sử dụng

### 1. Mở Cộng đồng
```
Landing Page → Navbar → Click "🌐 Cộng đồng"
```

### 2. Xem Feed
- Tab "Bảng tin" - Tất cả bài viết
- Tab "Thịnh hành" - Bài viết hot
- Tab "Đang theo dõi" - Bài viết từ người đang follow
- Tab "Tìm kiếm" - Tìm users

### 3. Tạo bài viết
```
Click "Tạo bài viết" → Nhập nội dung → (Optional) Thêm code → Đăng bài
```

### 4. Tương tác
```
Like: Click icon ❤️
Comment: Click icon 💬 → Nhập comment → Enter
Follow: Click nút Follow trên bài viết hoặc profile
```

### 5. Tìm kiếm
```
Tab "Tìm kiếm" → Nhập username → Click "Tìm" → Follow users
```

## Features chi tiết

### Post Card
```
┌─────────────────────────────────────────┐
│ 👤 username ✓  2 giờ trước    [Follow] │
├─────────────────────────────────────────┤
│ This is my post content...              │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ 📝 javascript                    │   │
│ │ const hello = () => {            │   │
│ │   console.log('Hello World');    │   │
│ │ }                                │   │
│ └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ 15 lượt thích  3 bình luận  👁️ 42     │
├─────────────────────────────────────────┤
│ [❤️ Thích] [💬 Bình luận] [🔗 Chia sẻ] │
└─────────────────────────────────────────┘
```

### Create Post Modal
```
┌─────────────────────────────────────────┐
│ Tạo bài viết mới                    [X] │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Bạn đang nghĩ gì?                   │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📝 [javascript ▼]                       │
│ ┌─────────────────────────────────────┐ │
│ │ Chia sẻ code của bạn... (optional)  │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                      [Hủy] [📤 Đăng bài]│
└─────────────────────────────────────────┘
```

### Comments Section
```
┌─────────────────────────────────────────┐
│ 👤 [Viết bình luận...          ] [📤]  │
├─────────────────────────────────────────┤
│ 👤 user1                                │
│    Great post! Thanks for sharing       │
│    5 phút trước                         │
├─────────────────────────────────────────┤
│ 👤 user2                                │
│    This is helpful                      │
│    10 phút trước                        │
└─────────────────────────────────────────┘
```

## Responsive Design

### Desktop (> 768px)
- Full width modal (90% max 1200px)
- 4 columns layout
- All features visible

### Mobile (< 768px)
- Full screen modal
- Single column
- Horizontal scroll for tabs
- Compact interactions

## Animations

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Slide Up
```css
@keyframes slideUp {
  from {
    transform: translate(-50%, -40%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}
```

### Hover Effects
- Transform: translateY(-2px)
- Box shadow increase
- Color transitions

## Security & Privacy

### Authentication Required
- Phải đăng nhập để xem Community
- Phải có userProfile để post/comment

### Data Validation
- Content không rỗng
- Username validation
- Sanitize inputs

### Permissions
- Chỉ author có thể edit/delete post
- Admin có thể moderate

## Performance Optimization

### Lazy Loading
- Load posts on demand
- Infinite scroll
- Image lazy loading

### Caching
- Cache user profiles
- Cache following list
- Debounce search

### Real-time Updates
- Firebase real-time listeners
- Optimistic UI updates
- Efficient re-renders

## Future Enhancements

### Phase 2
1. **Notifications**: Thông báo khi có like, comment, follow
2. **Direct Messages**: Nhắn tin riêng tư
3. **Groups**: Tạo nhóm theo chủ đề
4. **Hashtags**: Tag bài viết với #
5. **Mentions**: Tag users với @

### Phase 3
1. **Stories**: Chia sẻ nhanh 24h
2. **Live Coding**: Stream code real-time
3. **Challenges**: Thử thách code
4. **Leaderboard**: Bảng xếp hạng
5. **Badges**: Huy hiệu thành tích

### Phase 4
1. **AI Recommendations**: Gợi ý bài viết
2. **Code Review**: Review code của nhau
3. **Collaboration**: Code cùng nhau
4. **Portfolio**: Showcase projects
5. **Jobs**: Tìm việc làm

## Files Created

1. ✅ `client/src/components/Community.jsx` (500+ lines)
   - Main component
   - PostCard component
   - All logic

2. ✅ `client/src/components/Community.css` (800+ lines)
   - Đen tím theme
   - Responsive design
   - Animations

3. ✅ `client/src/firebase.js` (appended)
   - getCommunityPosts
   - createPost
   - likePost
   - commentOnPost
   - followUser
   - unfollowUser
   - getFollowing
   - getTrendingPosts
   - searchUsers

4. ✅ `client/src/components/Landing.jsx` (modified)
   - Import Community
   - Add state
   - Add button
   - Render modal

5. ✅ `COMMUNITY_FEATURE.md` (this file)
   - Complete documentation

## Testing Checklist

- [ ] Mở Community từ navbar
- [ ] Xem feed posts
- [ ] Tạo bài viết mới (text only)
- [ ] Tạo bài viết với code
- [ ] Like bài viết
- [ ] Unlike bài viết
- [ ] Comment trên bài viết
- [ ] Follow user từ post
- [ ] Unfollow user
- [ ] Xem tab Trending
- [ ] Search users
- [ ] Follow từ search results
- [ ] Responsive trên mobile
- [ ] Animations hoạt động
- [ ] Close modal

## Kết luận

Tính năng Community là một mạng xã hội hoàn chỉnh với:
- ✅ Feed/Timeline
- ✅ Posts với code snippets
- ✅ Like, Comment, Share, Bookmark
- ✅ Follow system
- ✅ Trending posts
- ✅ User search
- ✅ Đen tím theme đẹp mắt
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Real-time updates

Đây là nền tảng để developers kết nối, học hỏi và phát triển cùng nhau!
