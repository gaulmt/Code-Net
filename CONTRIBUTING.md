# Contributing to Code Net

Cảm ơn bạn đã quan tâm đến việc đóng góp cho Code Net! 🎉

## Cách đóng góp

### Báo cáo Bug
1. Kiểm tra [Issues](https://github.com/gaulmt/code-net/issues) xem bug đã được báo cáo chưa
2. Nếu chưa, tạo issue mới với:
   - Tiêu đề rõ ràng
   - Mô tả chi tiết bug
   - Các bước để reproduce
   - Screenshots (nếu có)
   - Browser và OS version

### Đề xuất tính năng
1. Tạo issue với label `enhancement`
2. Mô tả tính năng và lý do cần thiết
3. Đề xuất cách implement (nếu có)

### Pull Request
1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "Add: tính năng xyz"`
4. Push lên branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

### Coding Standards
- Sử dụng ES6+ syntax
- Component names: PascalCase
- Function names: camelCase
- CSS classes: kebab-case
- Indent: 2 spaces
- Semicolons: required
- Quotes: single quotes

### Commit Messages
- `Add:` - Thêm tính năng mới
- `Fix:` - Sửa bug
- `Update:` - Cập nhật code
- `Refactor:` - Refactor code
- `Style:` - Thay đổi styling
- `Docs:` - Cập nhật documentation

### Testing
- Test local trước khi commit
- Đảm bảo không có console errors
- Test trên nhiều browsers

## Development Setup

```bash
# Clone repo
git clone https://github.com/gaulmt/code-net.git
cd code-net

# Install dependencies
cd client
npm install

# Run dev server
npm run dev
```

## Project Structure

```
code-net/
├── client/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── firebase.js  # Firebase config
│   │   ├── socket.js    # Realtime sync
│   │   ├── App.jsx      # Main app
│   │   └── main.jsx     # Entry point
│   ├── package.json
│   └── vite.config.js
├── README.md
├── DEPLOY.md
└── CHANGELOG.md
```

## Questions?

Mở issue hoặc liên hệ [@gaulmt](https://github.com/gaulmt)

---

**Happy Coding! 🚀**
