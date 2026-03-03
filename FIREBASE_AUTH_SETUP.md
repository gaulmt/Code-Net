# 🔐 Firebase Authentication Setup - Email/Password

## ✅ Code đã sẵn sàng!

Dự án của bạn **ĐÃ TÍCH HỢP SẴN** đăng nhập bằng Email/Password và Google Sign-In.

Bạn chỉ cần **BẬT** tính năng này trên Firebase Console.

---

## 🚀 Bật Firebase Authentication (5 phút)

### Bước 1: Vào Firebase Console

1. Truy cập: https://console.firebase.google.com
2. Chọn project của bạn: **code-together-cfbfa**
3. Click vào **Authentication** (menu bên trái)

### Bước 2: Bật Email/Password

1. Click tab **Sign-in method**
2. Tìm **Email/Password** trong danh sách
3. Click vào **Email/Password**
4. Toggle **Enable** (bật lên)
5. Click **Save**

### Bước 3: Bật Google Sign-In (Optional)

1. Vẫn trong tab **Sign-in method**
2. Tìm **Google** trong danh sách
3. Click vào **Google**
4. Toggle **Enable** (bật lên)
5. Nhập **Project support email** (email của bạn)
6. Click **Save**

### Bước 4: Done! 🎉

Authentication đã sẵn sàng!

---

## 🎯 Tính năng đã có sẵn

### 1. Đăng ký (Sign Up)
- Form nhập: Username, Email, Password
- Validation: Email format, password strength
- Tự động tạo user profile
- Unique username check
- Avatar mặc định

### 2. Đăng nhập (Sign In)
- Form nhập: Email, Password
- Remember me (localStorage)
- Auto redirect sau login
- Session management

### 3. Google Sign-In
- One-click login
- Auto profile setup
- Avatar từ Google account
- No password needed

### 4. User Profile
- Username (unique)
- Email
- Avatar (customizable)
- Projects list
- Friends list

### 5. Session Management
- Auto login nếu đã đăng nhập
- Logout button
- Token refresh
- Secure authentication

---

## 📁 Code đã có

### 1. Firebase Functions (`client/src/firebase.js`)

```javascript
// Email/Password Sign Up
export const signUpUser = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  return userCredential.user;
};

// Email/Password Sign In
export const signInUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Google Sign In
export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  return userCredential.user;
};

// Sign Out
export const signOutUser = async () => {
  await signOut(auth);
};
```

### 2. Landing Component (`client/src/components/Landing.jsx`)

**Login Form:**
```javascript
if (view === 'login') {
  return (
    <div className="modal-box">
      <h2>Đăng Nhập</h2>
      <input type="email" placeholder="Email..." />
      <input type="password" placeholder="Mật khẩu..." />
      <button onClick={handleLogin}>Đăng nhập</button>
      <button onClick={onGoogleSignIn}>
        <FcGoogle /> Đăng nhập với Google
      </button>
    </div>
  );
}
```

**Signup Form:**
```javascript
if (view === 'signup') {
  return (
    <div className="modal-box">
      <h2>Đăng Ký</h2>
      <input type="text" placeholder="Tên của bạn..." />
      <input type="email" placeholder="Email..." />
      <input type="password" placeholder="Mật khẩu..." />
      <button onClick={handleSignup}>Đăng ký</button>
      <button onClick={onGoogleSignIn}>
        <FcGoogle /> Đăng ký với Google
      </button>
    </div>
  );
}
```

### 3. App Component (`client/src/App.jsx`)

**Handle Login:**
```javascript
const handleLogin = async (email, password) => {
  try {
    await signInUser(email, password);
    showToast('Đăng nhập thành công!', 'success');
  } catch (error) {
    showToast('Lỗi đăng nhập: ' + error.message, 'error');
  }
};
```

**Handle Signup:**
```javascript
const handleSignup = async (username, email, password) => {
  try {
    await signUpUser(email, password, username);
    showToast('Đăng ký thành công!', 'success');
  } catch (error) {
    showToast('Lỗi đăng ký: ' + error.message, 'error');
  }
};
```

**Handle Google Sign-In:**
```javascript
const handleGoogleSignIn = async () => {
  try {
    await signInWithGoogle();
    showToast('Đăng nhập thành công!', 'success');
  } catch (error) {
    showToast('Lỗi đăng nhập: ' + error.message, 'error');
  }
};
```

---

## 🔧 Cấu hình Firebase (Đã có sẵn)

### Firebase Config (`client/src/firebase.js`)

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA6hrAzFg-m-EnKX1VxvpGb5Ui0EKtkv28",
  authDomain: "code-together-cfbfa.firebaseapp.com",
  databaseURL: "https://code-together-cfbfa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "code-together-cfbfa",
  storageBucket: "code-together-cfbfa.firebasestorage.app",
  messagingSenderId: "462255130229",
  appId: "1:462255130229:web:38375b2adc62cea3d2da3c",
  measurementId: "G-P2QNFE1THL"
};
```

### Firebase Imports

```javascript
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
         signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from 'firebase/auth';

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
```

---

## 🎨 UI/UX Features

### 1. Landing Page
- Nút "Đăng nhập" trên navbar
- Nút "Đăng ký" trên navbar
- Modal đẹp với glass morphism
- Smooth animations

### 2. Login Form
- Email input với validation
- Password input với show/hide
- "Quên mật khẩu?" link (optional)
- Google Sign-In button
- Switch to Signup link

### 3. Signup Form
- Username input (unique check)
- Email input với validation
- Password input với strength meter
- Terms & Conditions checkbox (optional)
- Google Sign-In button
- Switch to Login link

### 4. User Menu (Sau khi đăng nhập)
- Avatar hiển thị
- Username hiển thị
- Dropdown menu:
  - Profile
  - Projects
  - Messenger
  - Settings
  - Logout

---

## 🔒 Security Features

### 1. Password Requirements
- Minimum 6 characters (Firebase default)
- Có thể thêm: uppercase, lowercase, numbers, special chars

### 2. Email Verification (Optional)
- Gửi email xác thực
- User phải verify trước khi dùng

### 3. Password Reset (Optional)
- "Quên mật khẩu?" link
- Gửi email reset password

### 4. Session Security
- Token auto refresh
- Secure cookie
- HTTPS only

---

## 📊 User Flow

### Đăng ký mới:
```
1. User click "Đăng ký"
2. Nhập: Username, Email, Password
3. Click "Đăng ký"
4. Firebase tạo account
5. App tạo user profile
6. Check username unique
7. Save to Realtime Database
8. Auto login
9. Redirect to home
```

### Đăng nhập:
```
1. User click "Đăng nhập"
2. Nhập: Email, Password
3. Click "Đăng nhập"
4. Firebase verify credentials
5. App load user profile
6. Auto login
7. Redirect to home
```

### Google Sign-In:
```
1. User click "Đăng nhập với Google"
2. Google popup
3. User chọn account
4. Firebase verify
5. App load/create profile
6. Auto login
7. Redirect to home
```

---

## 🐛 Troubleshooting

### Lỗi: "Firebase: Error (auth/email-already-in-use)"
**Nguyên nhân:** Email đã được đăng ký

**Giải pháp:**
- Dùng email khác
- Hoặc đăng nhập với email đó

### Lỗi: "Firebase: Error (auth/weak-password)"
**Nguyên nhân:** Password quá yếu (< 6 ký tự)

**Giải pháp:**
- Dùng password ít nhất 6 ký tự

### Lỗi: "Firebase: Error (auth/invalid-email)"
**Nguyên nhân:** Email không đúng format

**Giải pháp:**
- Check email format: example@domain.com

### Lỗi: "Firebase: Error (auth/user-not-found)"
**Nguyên nhân:** Email chưa đăng ký

**Giải pháp:**
- Đăng ký trước
- Hoặc check lại email

### Lỗi: "Firebase: Error (auth/wrong-password)"
**Nguyên nhân:** Password sai

**Giải pháp:**
- Nhập lại password
- Hoặc reset password

### Lỗi: "Firebase: Error (auth/configuration-not-found)"
**Nguyên nhân:** Chưa bật Authentication trên Firebase

**Giải pháp:**
- Làm theo Bước 1-3 ở trên

---

## ✅ Checklist

### Firebase Console:
- [ ] Vào Firebase Console
- [ ] Chọn project
- [ ] Vào Authentication
- [ ] Bật Email/Password
- [ ] Bật Google Sign-In (optional)
- [ ] Save

### Test:
- [ ] Test đăng ký với email/password
- [ ] Test đăng nhập với email/password
- [ ] Test Google Sign-In
- [ ] Test logout
- [ ] Test session persist (refresh page)

---

## 🎯 Next Steps (Optional)

### 1. Email Verification
```javascript
import { sendEmailVerification } from 'firebase/auth';

await sendEmailVerification(user);
```

### 2. Password Reset
```javascript
import { sendPasswordResetEmail } from 'firebase/auth';

await sendPasswordResetEmail(auth, email);
```

### 3. Update Profile
```javascript
import { updateProfile } from 'firebase/auth';

await updateProfile(user, {
  displayName: "New Name",
  photoURL: "https://example.com/avatar.jpg"
});
```

### 4. Delete Account
```javascript
import { deleteUser } from 'firebase/auth';

await deleteUser(user);
```

---

## 📞 Support

### Firebase Console:
https://console.firebase.google.com/project/code-together-cfbfa/authentication

### Firebase Docs:
- Email/Password: https://firebase.google.com/docs/auth/web/password-auth
- Google Sign-In: https://firebase.google.com/docs/auth/web/google-signin

### Troubleshooting:
- Check console logs (F12)
- Check Firebase Console → Authentication → Users
- Check Network tab for API calls

---

## 🎉 Kết luận

**Tất cả code đã sẵn sàng!**

Bạn chỉ cần:
1. Vào Firebase Console
2. Bật Email/Password authentication
3. Bật Google Sign-In (optional)
4. Test!

**Thời gian:** 5 phút
**Độ khó:** Rất dễ
**Status:** ✅ Ready to use

---

**Author:** Nguyễn Đăng Dương
**Facebook:** https://www.facebook.com/share/18Fa25fAke/
**Project:** Code Net - Real-time Collaborative Code Editor

**Happy Authenticating! 🔐**
