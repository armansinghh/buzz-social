# Buzz

A modern, production-grade social media application built with React 19, TypeScript, Vite, and Firebase.

> What's buzzing right now.

Buzz is a fully functional social media frontend with real-time-ready architecture, feature-based code organization, and Firebase-backed authentication, data persistence, and media storage via Cloudinary.

---

<!-- TODO: screenshots of UI here -->
<!-- screenshots:
  - Home feed (light + dark mode side by side)
  - Post card with comments open (CommentsModal)
  - Profile page
  - Explore page — Trending, People, and Media tabs
  - Search results with highlighted matches
  - Create Post modal
  - Notification modal
  - Auth / Onboarding screens
-->

![Auth Page](/public/ss/auth.png)

---

## ✨ Features

### 🔐 Authentication
- Email/password sign up & sign in
- Google OAuth via Firebase popup flow
- Persistent auth state via `onAuthStateChanged`
- Protected routes — redirects to `/auth` if unauthenticated, `/onboarding` if no username set
- Username onboarding step with uniqueness validation
- Logout from navbar

### 📝 Posts
- Create posts with optional image or video media (uploaded via Cloudinary)
- Caption with 2200-character limit and live counter
- Like / unlike posts with Firestore persistence (`arrayUnion` / `arrayRemove`)
- Double-tap media or double-click caption to like (heart burst animation)
- Single-click media opens full-screen `MediaViewerModal`
- Paginated feed — 10 posts per page with "Load More"
- Remove file preview before posting

### 💬 Comments & Reactions
- Add comments on any post (persisted to Firestore)
- Emoji reactions on individual comments via `emoji-picker-react`
- Floating emoji picker with smart viewport-aware positioning
- Toggle reactions — clicking an existing reaction removes it
- Comment count visible on feed cards
- Full comments view in a split-panel modal (media left, comments right on desktop)

### 🔔 Notifications
- Notification modal showing like, comment, and follow events
- Notifications stored per-user in Firestore subcollection (`users/{uid}/notifications`)
- Unread badge count in left sidebar and mobile bottom nav
- Mark all as read on modal open

### 👥 Follow System
- Follow / unfollow users from profile pages, Explore, and Search results
- Follower and following counts on profile
- "Following" feed tab on Home — filters posts to people you follow (includes your own posts)
- Suggested users in right sidebar (desktop)
- Follow state persisted to Firestore subcollections (`users/{uid}/following`, `users/{uid}/followers`)

### 🔍 Search
- Debounced (400ms) combined search — users and posts in one query
- User results matched by username prefix via Firestore range query
- Post results matched by caption or author username (client-side filter on recent 20 posts)
- Highlighted matched text in results
- Filter pills — All / People / Posts
- Loading skeletons and empty states

### 🌐 Explore
- **Trending** tab — posts ranked by time-decay score (Hacker News gravity algorithm)
- Hashtag topic extraction from captions with click-to-filter
- **People** tab — paginated user directory with follow actions, lazy-loaded on tab open
- **Media** tab — 3-column photo/video grid with a lightbox viewer (keyboard arrow navigation, prev/next buttons)
- Tab state persisted in `sessionStorage`

### 📄 Post Detail
- Dedicated `/post/:id` route
- Falls back to Firestore fetch if post not in context cache

### 🎨 UI & Theming
- Light / dark mode toggle with system preference detection on first load
- Theme persisted via `localStorage`
- CSS variable-based theming with smooth 0.15s transitions
- Toast notification system (success, error, info) with enter/exit animations
- Skeleton shimmer loading states throughout
- Responsive layout — left sidebar + right sidebar on desktop, bottom nav on mobile
- Scroll position restoration per route via `localStorage`
- Animated tab indicator using Framer Motion spring physics
- Heart burst overlay animation on double-tap like

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Bundler | Vite 7 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| Icons | FontAwesome 7 (free solid, regular, brands) |
| Emoji Picker | emoji-picker-react v4 |
| Auth & DB | Firebase 12 (Auth + Firestore) |
| Media Uploads | Cloudinary (unsigned upload preset) |
| State | React Context API |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── App.tsx                   # RouterProvider root
│   └── router.tsx                # Route definitions + ProtectedRoute wrappers
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx         # Main shell: sidebar + main + modals
│   │   ├── Navbar.tsx            # Logo, theme toggle, user avatar, logout
│   │   ├── LeftSidebar.tsx       # Desktop nav links + notification badge
│   │   ├── RightSidebar.tsx      # Suggested users (desktop only)
│   │   └── BottomNav.tsx         # Mobile tab bar
│   └── ui/
│       ├── Avatar.tsx            # Initials fallback avatar
│       └── Tabs.tsx              # Animated tab bar (Framer Motion)
├── contexts/
│   ├── UIContext.tsx             # Active modal, theme, emoji picker position
│   └── ToastContext.tsx          # Global toast queue with animations
├── features/
│   ├── auth/
│   │   ├── AuthContext.tsx       # Firebase user state, profile, follow helpers
│   │   ├── authService.ts        # Google OAuth, email/password, signOut
│   │   └── ProtectedRoute.tsx    # Auth + onboarding guard
│   ├── follow/
│   │   └── FollowContext.tsx     # Follow/unfollow, follower counts (Firestore subcollections)
│   ├── navigation/
│   │   └── ScrollRestoration.tsx # Per-route scroll position save/restore
│   ├── notifications/
│   │   ├── NotificationContext.tsx
│   │   ├── notifications.types.ts
│   │   └── components/
│   │       └── NotificationModal.tsx
│   └── posts/
│       ├── PostContext.tsx        # Posts array, pagination, like/comment/reaction mutations
│       ├── posts.types.ts         # Post, Comment, Reaction interfaces
│       └── components/
│           ├── PostCard.tsx
│           ├── CommentItem.tsx
│           ├── CommentInput.tsx
│           ├── CommentsModal.tsx
│           ├── CreatePostModal.tsx
│           ├── EmojiPickerPortal.tsx
│           └── MediaViewerModal.tsx
├── hooks/
│   └── useDebounce.ts
├── lib/
│   ├── firebase.ts               # App, Auth, Firestore instances
│   └── cloudinary.ts             # Unsigned upload helper
├── pages/
│   ├── Home.tsx                  # Feed + Following tabs
│   ├── Explore.tsx               # Trending / People / Media tabs
│   ├── Search.tsx                # Debounced combined search
│   ├── Profile.tsx               # User profile + post grid
│   ├── PostDetail.tsx            # Single post view
│   ├── Auth.tsx                  # Login / Sign up
│   ├── Onboarding.tsx            # Username setup
│   └── NotFound.tsx
├── utils/
│   └── formatRelativeTime.ts     # just now / 5m / 2h / 3d / 1w
├── styles/
│   └── index.css                 # CSS variables, Tailwind import, animations
└── main.tsx                      # Entry point — provider tree
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
3. Create a **Firestore** database (start in test mode for development)
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

<!-- ## 🔑 Demo Credentials

For local testing:

```
Email:    testuser@example.com
Password: 123456
```

--- -->

## 🗂 Context Architecture

| Provider | Responsibility |
|---|---|
| `AuthProvider` | Firebase user state, profile fetch, login/signup/logout, follow helpers |
| `UIProvider` | Active modal state, light/dark theme, emoji picker position |
| `PostProvider` | Posts array, cursor-based pagination, like/comment/reaction Firestore mutations |
| `FollowProvider` | Follow/unfollow actions, follower & following counts, lazy-loaded per uid |
| `NotificationProvider` | Notification list (Firestore-backed), unread count, mark-as-read |
| `ToastProvider` | Global toast queue with timed dismiss and enter/exit animations |

Provider order in `main.tsx`:
```
AuthProvider
  └─ UIProvider
       └─ ToastProvider
            └─ NotificationProvider
                 └─ PostProvider
                      └─ FollowProvider
```

---

## 🧭 Routing

| Path | Component | Guard |
|---|---|---|
| `/` | Home (feed + following tabs) | ✅ Protected |
| `/explore` | Explore (trending, people, media) | ✅ Protected |
| `/search` | Search | ✅ Protected |
| `/profile/:id` | Profile (by username or uid) | ✅ Protected |
| `/post/:id` | Post detail | ✅ Protected |
| `/auth` | Login / Sign Up | Public |
| `/onboarding` | Username setup | Public |
| `*` | 404 Not Found | Public |

Protected routes redirect to `/auth` if unauthenticated, or to `/onboarding` if the user has no username set yet.

---

## 🔒 Firestore Data Model

```
users/{uid}
  ├── uid, username, name, email, avatar, createdAt
  ├── following/{targetUid}     → { followedAt: ISO string }
  ├── followers/{followerUid}   → { followedAt: ISO string }
  └── notifications/{notifId}
        ├── recipientId, senderId, senderName, senderAvatar
        ├── type: "like" | "comment" | "follow"
        ├── postId? (for like/comment)
        ├── isRead: boolean
        └── createdAt: ISO string

posts/{postId}
  ├── authorId, authorUsername, authorAvatar
  ├── caption, createdAt
  ├── likes: string[]           (array of user UIDs)
  ├── media?: { url, type: "image" | "video" }
  └── comments: Comment[]
        ├── id, authorId, authorUsername, authorAvatar
        ├── text, createdAt
        └── reactions: { emoji: string, users: string[] }[]
```

---

## 🗺️ Roadmap

- [ ] Real-time feed updates via Firestore `onSnapshot`
- [ ] Push / in-app notifications persisted and live
- [ ] Firestore security rules — lock down read/write per user
- [ ] Error boundaries — graceful fallback UI on Firestore/component errors
- [ ] Shared `UserProfile` type extracted to `src/types/`
- [ ] Deduplicate `PersonCard` / `PeopleCard` across Search and Explore
- [ ] Extract `EmptyState` and skeleton components to `src/components/ui/`
- [ ] Post deletion (author only)
- [ ] Edit profile (bio, avatar upload)
- [ ] `AnimatePresence` on modals for exit animations (Framer Motion)
- [ ] Explore page — hashtag detail page at `/tag/:name`
- [ ] Story / ephemeral posts
- [ ] Repost / quote post
- [ ] Direct messaging
- [ ] Full-text search with Algolia or Typesense
- [ ] Rate limiting & spam protection on notifications
- [ ] PWA support (offline, installable)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by Arman Singh