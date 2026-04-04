# Buzz

A modern social media application built with React, TypeScript, Vite, and Firebase.

> What's buzzing right now.

Buzz is a structured, scalable social media frontend built with production-ready architecture. It focuses on clean layout systems, modular feature organization, and real-world app patterns — backed by Firebase for authentication and data persistence.

---

## ✨ Features

### 🔐 Authentication
- Email/password sign up & sign in
- Google OAuth via Firebase
- Persistent auth state via `onAuthStateChanged`
- Protected routes with username onboarding flow
- Logout from navbar

### 📝 Posts
- Create posts with optional image/video media
- Caption with 2200-character limit
- Like / unlike posts
- Double-tap media to like (with heart burst animation)
- Delete file preview before posting

### 💬 Comments & Reactions
- Add comments on any post
- Emoji reactions on individual comments (via `emoji-picker-react`)
- Floating emoji picker with smart position detection
- Comment count visible on feed cards

### 🔔 Notifications
- Notification modal with like, comment, and follow types
- Unread badge count in sidebar and bottom nav
- Mark all as read on modal open

### 🎨 UI & Theming
- Light/dark mode toggle with system preference detection
- Persisted theme via `localStorage`
- Smooth CSS variable-based theme transitions
- Toast notification system (success, error, info)
- Media viewer modal for full-screen image/video
- Skeleton shimmer animations

### 🧭 Layout
- Fixed top navbar
- Left navigation sidebar (desktop)
- Scrollable middle feed
- Right sidebar with suggested users
- Mobile bottom navigation bar
- Safe area inset support for mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Bundler | Vite 7 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| Icons | FontAwesome 7 |
| Emoji Picker | emoji-picker-react |
| Auth & DB | Firebase (Auth + Firestore) |
| State | React Context API |

---

## 📁 Project Structure

```
src/
├── app/                    # App bootstrap, router
├── components/
│   ├── layout/             # AppLayout, Navbar, LeftSidebar, RightSidebar, BottomNav
│   └── ui/                 # Avatar component
├── features/
│   ├── auth/               # AuthContext, authService, ProtectedRoute, useAuth
│   ├── notifications/      # NotificationContext, NotificationModal, types, mock data
│   ├── posts/              # PostContext, PostCard, CommentsModal, CreatePostModal,
│   │                       # CommentItem, CommentInput, EmojiPickerPortal, MediaViewerModal
│   └── ui/                 # UIContext (modals, theme, emoji picker), ToastContext
├── lib/
│   └── firebase.ts         # Firebase app, auth, Firestore instances
├── pages/                  # Home, Explore, Search, Profile, Auth, Onboarding, NotFound
├── utils/
│   └── formatRelativeTime  # Human-readable timestamps (just now, 5m, 2h, 3d, 1w)
├── index.css               # Global styles, CSS variables, animations
└── main.tsx                # App entry point with all providers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- A Firebase project with **Authentication** and **Firestore** enabled

### Installation

```bash
git clone https://github.com/armansinghh/buzz-social.git
cd buzz-social
npm install
npm run dev
```

### Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** and **Google** sign-in providers
3. Create a **Firestore** database
4. Replace the config in `src/lib/firebase.ts` with your own project credentials

---

## 🔑 Demo Credentials

For local testing (if using the default mock setup):

```
Email:    testuser@example.com
Password: 123456
```

---

## 🗂 Context Architecture

| Provider | Responsibility |
|---|---|
| `AuthProvider` | Firebase user state, profile, login/signup/logout |
| `UIProvider` | Active modal, theme, emoji picker position |
| `PostProvider` | Posts array, like/comment/reaction mutations |
| `NotificationProvider` | Notifications list, unread count, mark-as-read |
| `ToastProvider` | Global toast queue with enter/exit animations |

---

## 🧭 Routing

| Path | Component | Guard |
|---|---|---|
| `/` | Home (feed) | ✅ Protected |
| `/explore` | Explore | ✅ Protected |
| `/search` | Search | ✅ Protected |
| `/profile/:id` | Profile | ✅ Protected |
| `/auth` | Login / Sign Up | Public |
| `/onboarding` | Username setup | Public |
| `*` | 404 Not Found | Public |

Protected routes redirect to `/auth` if unauthenticated, or `/onboarding` if no username is set.

---

## 🧭 Roadmap

- [ ] Persist posts to Firestore
- [ ] Real-time feed updates
- [ ] Follow / unfollow users
- [ ] Profile page with post grid
- [ ] Push notifications
- [ ] Image upload via Firebase Storage
- [ ] Dark mode polish for emoji picker
- [ ] Deployment (Vercel)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by Arman Singh