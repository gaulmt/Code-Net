# Changelog

All notable changes to Code Net project will be documented in this file.

## [1.0.1] - 2026-03-01

### Fixed
- 🐛 Fixed logout functionality - now properly signs out from Firebase instead of just reloading page
- ✅ Logout now clears auth state and returns to landing page

## [1.0.0] - 2026-03-01

### Added
- 🎨 Real-time collaborative code editor with Monaco Editor
- 🔥 Firebase Realtime Database integration
- 🔐 Firebase Authentication (Email/Password + Google Sign-In)
- 👥 Team management with 5 roles (Leader, Developer, Designer, Member, Viewer)
- 🌐 Multi-language support (JavaScript, Python, HTML, Java, C++, TypeScript)
- ⚡ WebAssembly compilation for JavaScript, Python, HTML
- 📁 File manager with create/delete/rename
- 💬 Real-time chat sidebar
- 🎯 Code execution with terminal output
- 👤 User profile system with custom avatars
- 📊 Projects manager (view, delete, share projects)
- 🎨 Glass morphism UI design
- 🌙 Dark theme with purple gradient accents
- ✨ Particle text animation for logo
- 🏷️ Verified badge for admin users
- 📱 Responsive design for mobile/tablet

### Features Detail

#### Authentication
- Email/Password registration and login
- Google Sign-In with popup
- Unique username system
- Profile management with avatar customization
- Admin account with special badge (gaulmt)

#### Editor
- Monaco Editor (VS Code engine)
- Syntax highlighting for 50+ languages
- Auto-complete and IntelliSense
- Real-time cursor tracking
- Multi-file support

#### Team Management
- Role-based permissions (Read, Write, Manage)
- Leader can assign roles and permissions
- Transfer leadership functionality
- Real-time user list with status
- Permission menu for each member

#### Code Execution
- WebAssembly mode for JS, Python, HTML
- API mode for Java, C++, C, TypeScript
- Toggle between WASM/API modes
- Terminal with output capture
- Error handling and display

#### File Management
- Create, delete, rename files
- File tree navigation
- Current file indicator
- Resizable panels

#### Projects
- Create and join projects with room codes
- Save projects to user profile
- View project list sorted by last access
- Delete old projects
- Share projects via room code

#### UI/UX
- Glass morphism navbar with blur effect
- Particle text logo animation
- Feature showcases with language logos
- Team showcase with real avatars (admin, Bill Gates, Mark Zuckerberg)
- Professional footer with links
- Loading states and skeletons
- Smooth transitions and animations

### Technical Stack
- **Frontend**: React 18 + Vite 5
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Database**: Firebase Realtime Database
- **Auth**: Firebase Authentication
- **Icons**: React Icons (Feather Icons)
- **Styling**: Custom CSS with modern features
- **Build**: Vite with optimized production build
- **Deploy**: Vercel-ready configuration

### Performance
- Lazy loading for heavy components
- Optimized bundle size
- Firebase connection pooling
- Debounced real-time updates
- Efficient re-renders with React hooks

### Security
- Firebase security rules for database
- Authentication required for sensitive operations
- XSS protection in code execution
- Sandboxed iframe for HTML preview
- Input validation and sanitization

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Issues
- Python WASM requires ~10MB download on first use
- EMKC Piston API may have rate limits
- Large files (>1MB) may cause performance issues

### Credits
- **Author**: Nguyễn Đăng Dương ([@gaulmt](https://github.com/gaulmt))
- **Monaco Editor**: Microsoft
- **Firebase**: Google
- **Pyodide**: Mozilla
- **Icons**: Feather Icons
- **Avatars**: DiceBear API

---

## Future Roadmap

### v1.1.0 (Planned)
- [ ] Video/Voice chat integration
- [ ] Code review and comments
- [ ] Git integration
- [ ] Themes customization
- [ ] Keyboard shortcuts customization
- [ ] Export project as ZIP
- [ ] Import from GitHub

### v1.2.0 (Planned)
- [ ] AI code completion
- [ ] Code formatting (Prettier)
- [ ] Linting (ESLint)
- [ ] Debugging tools
- [ ] Performance profiler
- [ ] Mobile app (React Native)

### v2.0.0 (Future)
- [ ] Self-hosted option
- [ ] Enterprise features
- [ ] Advanced analytics
- [ ] Custom domains per project
- [ ] API for integrations
- [ ] Plugins system

---

**Last Updated**: March 1, 2026
