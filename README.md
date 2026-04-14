# Buzz

A modern social media application built with React 19, TypeScript, Vite, and Firebase.

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
- Create posts with optional image/video media (uploaded via Cloudinary)
- Caption with 2200-character limit
- Like / unlike posts with Firestore persistence
- Double-tap media to like (with heart burst animation)
- Paginated feed (10 posts per page) with "Load More"
- Delete file preview before posting

### 💬 Comments & Reactions
- Add comments on any post (persisted to Firestore)
- Emoji reactions on individual comments via `emoji-picker-react`
- Floating emoji picker with smart viewport-aware positioning
- Comment count visible on feed cards
- Full comments view in a split-panel modal

### 🔔 Notifications
- Notification modal with like, comment, and follow event types
- Unread badge count in sidebar and bottom nav
- Mark all as read on modal open

### 👥 Follow System
- Follow / unfollow users from their profile page
- Follower and following counts on profile
- "Following" feed tab filters posts to people you follow
- Persisted to Firestore subcollections (`users/{uid}/following`, `users/{uid}/followers`)

### 🎨 UI & Theming
- Light/dark mode toggle with system preference detection
- Persisted theme via `localStorage`
- Smooth CSS variable-based theme transitions
- Toast notification system (success, error, info) with enter/exit animations
- Media viewer modal for full-screen image/video
- Skeleton shimmer loading states
- Responsive layout: sidebar on desktop, bottom nav on mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Bundler | Vite 7 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| Icons | FontAwesome 7 |
| Emoji Picker | emoji-picker-react v4 |
| Auth & DB | Firebase 12 (Auth + Firestore) |
| Media Uploads | Cloudinary |
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
│   ├── auth/               # AuthContext, authService, ProtectedRoute
│   ├── follow/             # FollowContext (follow/unfollow, counts)
│   ├── notifications/      # NotificationContext, NotificationModal, types, mock data
│   ├── posts/              # PostContext, PostCard, CommentsModal, CreatePostModal,
│   │                       # CommentItem, CommentInput, EmojiPickerPortal, MediaViewerModal
│   └── ui/                 # UIContext (modals, theme, emoji picker), ToastContext
├── lib/
│   └── firebase.ts         # Firebase app, auth, Firestore instances
├── pages/                  # Home, Explore, Search, Profile, Auth, Onboarding, NotFound
├── services/
│   └── cloudinary.ts       # Media upload helper
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
- A Cloudinary account for media uploads

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
3. Create a **Firestore** database in production mode
4. Replace the config in `src/lib/firebase.ts` with your own project credentials

### Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Create an **unsigned upload preset**
3. Add the following to a `.env` file in the project root:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## 🔑 Demo Credentials

For local testing:

```
Email:    testuser@example.com
Password: 123456
```

---

## 🗂 Context Architecture

| Provider | Responsibility |
|---|---|
| `AuthProvider` | Firebase user state, profile, login/signup/logout, follow helpers |
| `UIProvider` | Active modal, theme, emoji picker position |
| `PostProvider` | Posts array, pagination, like/comment/reaction mutations |
| `FollowProvider` | Follow/unfollow, follower & following counts (Firestore-backed) |
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

## 🔒 Firestore Data Model

```
users/{uid}
  ├── username, name, email, avatar, createdAt
  ├── following/{targetUid}   → { followedAt }
  └── followers/{followerUid} → { followedAt }

posts/{postId}
  ├── authorId, authorUsername, authorPhoto
  ├── caption, createdAt
  ├── likes: string[]
  ├── media?: { url, type }
  └── comments: Comment[]
        ├── id, authorId, text, createdAt
        └── reactions: { emoji, users[] }[]
```

---

## 🗺️ Roadmap

- [ ] Real-time feed updates via Firestore `onSnapshot`
- [ ] Push / in-app notifications persisted to Firestore
- [ ] Explore page with trending posts or hashtags
- [ ] Full-text search with Algolia or Firestore queries
- [ ] Post deletion (author only)
- [ ] Edit profile (bio, avatar upload)
- [ ] Story / ephemeral posts
- [ ] Repost / quote post
- [ ] Direct messaging
- [ ] Rate limiting & spam protection
- [ ] PWA support (offline, installable)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by Arman Singh