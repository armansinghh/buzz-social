# Buzz

> A production-grade social media app built as a portfolio project — React 19, TypeScript, Firebase, and Tailwind CSS v4.

[![Version](https://img.shields.io/badge/version-1.1.0-black)](https://github.com/armansinghh/buzz-social/blob/main/CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-black)](LICENSE)
[![Live](https://img.shields.io/badge/live-buzz--social.vercel.app-black)](https://buzzsocial.vercel.app)

---

![Preview](/public/features-preview.gif)

---

## Why I built this

Most portfolio projects are todo apps with a database bolted on. I wanted to build something that forced me to solve the kinds of problems that come up in real production apps like auth edge cases, optimistic UI with rollback, offline failure handling, live data synchronization across components.

I also wanted a project I'd actually use. Social apps touch nearly every engineering surface: auth, file uploads, real-time data, pagination, notifications, complex UI state. If I could ship something that felt polished and handled the ugly edge cases, I'd know I could build production software.

Buzz is that project.

---

## The build process — what I tried, what failed, what I learned

### The auth offline bug

The most interesting bug I encountered was a silent failure in the auth flow. On a slow or offline connection, the Firestore profile fetch would time out and return nothing. The app interpreted `profile = null` as "this is a new user" and redirected to onboarding — where the username form, on submit, would **overwrite an existing user's username** with whatever they typed.

The failure was silent because the error was never surfaced. The fix required thinking in terms of states rather than values: `null` doesn't mean "no user", it can mean "we don't know yet." I added an explicit `profileError` boolean to `AuthContext`, replaced the silent redirect in `ProtectedRoute` with a "Connection problem / Try again" screen, and added a safety check in `Onboarding` that re-verifies no username exists before writing.

The lesson: distinguish between "data is absent" and "data failed to load." Treating them as the same thing causes destructive downstream behavior.

### Author metadata on posts — the denormalization trap

Early on I stored `authorUsername` and `authorAvatar` directly on each post document. This is standard Firestore denormalization — fewer reads, simpler queries. But it meant that if a user updated their profile, every post they'd ever written showed their old name and avatar.

I tried writing a migration script to backfill all posts. It worked, but it was fragile — any post created in a race condition window would still have stale data.

The better fix was to stop trusting the snapshot data at render time. Every `PostCard`, `CommentItem`, and modal now calls `useUserProfile(authorId)` — a hook with a module-level cache and in-flight deduplication — to resolve the author live. The post document still stores `authorUsername` as a fallback for loading states, but the displayed data is always fresh. Fewer writes to maintain, no migration scripts ever again.

### Scroll restoration

React Router doesn't restore scroll position by default, and the browser's native behavior doesn't work well in a custom scroll container (I scroll the `<main>` element, not `window`). My first attempt saved scroll position on component unmount — which was wrong. When you navigate away, React tears down the DOM, so `container.scrollTop` at unmount is always `0`. I was overwriting good saved data with zero.

The fix was to save on `scroll` events (debounced to 150ms) and restore via `useLayoutEffect` synchronously before the browser paints. A `isRestoringRef` flag prevents the programmatic scroll from firing the save handler and overwriting itself.

### Notifications — write amplification

Firebase bills per document write. My first implementation of "mark all as read" wrote one Firestore document per notification every time the modal opened — even if everything was already read. On an account with 200 notifications that's 200 wasted writes per modal open.

The fix was a client-side filter: only call `updateDoc` on notifications where `isRead === false`. Zero unread notifications means zero writes. For like notifications I also implemented a deterministic document ID (`like_${postId}`) so all likes on the same post upsert a single document rather than creating a new one per like.

---

## Technical decisions

**React + Vite over Next.js** — Buzz is a pure client-side SPA. There are no public pages that benefit from SSR, and the auth gate means nothing needs to be indexed by search engines at v1. Vite's dev server is significantly faster than Next.js for a project this size. I've scoped a v2 migration to Next.js 15 (App Router) for when public profiles and SEO actually matter.

**Firebase/Firestore over Supabase** — Firestore's offline SDK behavior and real-time listeners are genuinely good. For a v1 where I'm building alone and need to move fast, Firebase's auth + Firestore combo eliminates an entire infrastructure layer. Supabase (Postgres) is on the v2 roadmap because SQL composability and row-level security are better for a maturing schema — but for iteration speed at v1, Firebase won.

**Context API over Redux/Zustand** — The state in Buzz is domain-specific (posts, auth, follow, notifications) and doesn't need cross-slice coordination. A `PostContext` that owns post mutations is simpler and more colocated than a global Redux store. If the app scales to the point where context re-render performance becomes a problem, Zustand is the right next step.

**Cloudinary for media** — Unsigned upload presets with no backend required. Firebase Storage is the obvious alternative but Cloudinary's transformation URL API (responsive images, video thumbnails) is better and the free tier is generous enough for a portfolio project.

**Tailwind CSS v4** — The CSS variables-first approach aligns perfectly with the theming system I wanted. CSS custom properties for all color tokens means the dark mode transition is a single class toggle, not a full stylesheet swap.

---

## Features

### Auth
- Email/password and Google OAuth (popup flow)
- Persistent sessions via `onAuthStateChanged`
- Username onboarding step with uniqueness validation and safety checks against accidental overwrites
- Explicit offline error state in `ProtectedRoute` with retry — no silent redirects

### Posts
- Create posts with optional image or video (Cloudinary, unsigned preset)
- Caption with 2200-character limit and live counter
- Paginated feed — 10 posts per page, cursor-based with `startAfter`
- Like / unlike with `arrayUnion` / `arrayRemove`
- Double-tap media or double-click caption to like (heart burst animation, no duplicate writes)
- Single-click media opens fullscreen `MediaViewerModal`
- Delete post (author only) with optimistic update and rollback on failure

### Comments & Reactions
- Add comments, persisted to Firestore
- Emoji reactions on individual comments via `emoji-picker-react`
- Viewport-aware floating emoji picker
- Toggle reactions — re-clicking removes
- Split-panel `CommentsModal` (media left, comments right on desktop)

### Notifications
- Like, comment, and follow events per user in a Firestore subcollection
- Deterministic like notification ID — all likes on a post upsert one document
- Unread badge in sidebar and mobile nav
- Zero-write mark-all-read when everything is already read
- Clicking a notification routes to the sender's profile (follow) or the specific post (like/comment)

### Follow System
- Follow / unfollow from profile pages, Explore, and Search
- Follower and following counts, live from Firestore subcollections
- "Following" feed tab filters posts to people you follow
- `getFollowerCount` fetches each uid once per session — no redundant Firestore reads on re-render

### Search
- Debounced (400ms) combined search — users by username prefix, posts by caption or author
- Highlighted matched text
- Filter pills: All / People / Posts

### Explore
- **Trending** — time-decay score (Hacker News gravity algorithm), hashtag extraction, click-to-filter
- **People** — paginated user directory, lazy-loaded on tab select
- **Media** — 3-column grid with lightbox (keyboard arrow navigation)
- Tab state persisted in `sessionStorage`

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Bundler | Vite 7 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| Icons | react-icons 5 |
| Emoji Picker | emoji-picker-react v4 |
| Auth & DB | Firebase 12 (Auth + Firestore) |
| Media | Cloudinary (unsigned upload) |
| State | React Context API |
| Deployment | Vercel |

---

## Project structure

```
src/
├── app/
│   ├── App.tsx                   # RouterProvider root
│   └── router.tsx                # Route definitions + ProtectedRoute
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx         # Main shell: sidebar + main + modals
│   │   ├── Navbar.tsx
│   │   ├── LeftSidebar.tsx
│   │   ├── RightSidebar.tsx      # Suggested users (desktop only)
│   │   └── BottomNav.tsx         # Mobile tab bar
│   ├── skeletons/                # Shimmer loading states
│   └── ui/
│       ├── Avatar.tsx            # Initials fallback avatar
│       ├── Dropdown.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── SplashScreen.tsx
│       └── Tabs.tsx              # Animated tab bar (Framer Motion)
├── contexts/
│   ├── UIContext.tsx             # Active modal, theme, emoji picker position
│   └── ToastContext.tsx          # Global toast queue
├── features/
│   ├── auth/
│   │   ├── AuthContext.tsx       # Firebase user state, profileError, retryProfile
│   │   ├── authService.ts
│   │   ├── authErrors.ts
│   │   └── ProtectedRoute.tsx    # Auth + onboarding guard, offline error screen
│   ├── explore/
│   ├── follow/
│   │   └── FollowContext.tsx     # Follow/unfollow, deduped follower fetches
│   ├── navigation/
│   │   └── ScrollRestoration.tsx # Per-route scroll save/restore
│   ├── notifications/
│   │   ├── NotificationContext.tsx
│   │   └── components/
│   │       └── NotificationModal.tsx
│   ├── posts/
│   │   ├── PostContext.tsx        # Posts, pagination, mutations, rollback
│   │   └── components/
│   │       ├── PostCard.tsx
│   │       ├── CommentItem.tsx
│   │       ├── CommentInput.tsx
│   │       ├── CommentsModal.tsx
│   │       ├── CreatePostModal.tsx
│   │       ├── EmojiPickerPortal.tsx
│   │       └── MediaViewerModal.tsx
│   ├── profile/
│   │   ├── Profile.tsx
│   │   └── components/
│   │       └── EditProfileModal.tsx
│   └── search/
├── hooks/
│   ├── useDebounce.ts
│   ├── usePageTitle.ts
│   └── useUserProfile.ts         # Module-level cache + in-flight deduplication
├── lib/
│   ├── firebase.ts
│   └── cloudinary.ts
├── services/
│   ├── postBuilder.ts
│   └── postMapper.ts             # Defensive mapping from raw Firestore docs
├── types/
│   ├── notification.ts
│   ├── post.ts
│   └── user.ts
├── utils/
│   └── formatRelativeTime.ts
├── styles/
│   └── index.css                 # CSS variables, Tailwind, animations
└── main.tsx                      # Provider tree
```

---

## Data model

```
users/{uid}
  ├── uid, username, name, email, avatar, createdAt
  ├── following/{targetUid}     → { followedAt }
  ├── followers/{followerUid}   → { followedAt }
  └── notifications/{notifId}
        ├── recipientId, senderId
        ├── type: "like" | "comment" | "follow"
        ├── postId?             (like/comment only)
        ├── isRead: boolean
        └── createdAt

posts/{postId}
  ├── authorId, authorUsername (fallback), authorAvatar (fallback)
  ├── caption, createdAt
  ├── likes: string[]
  ├── media?: { url, type: "image" | "video" }
  └── comments: Comment[]
        ├── id, authorId
        ├── text, createdAt
        └── reactions: { emoji: string, users: string[] }[]
```

Note: `authorUsername` and `authorAvatar` on posts are legacy fallback fields. All display-time resolution happens live via `useUserProfile(authorId)` with a module-level cache.

---

## Getting started

**Prerequisites:** Node.js ≥ 20, a Firebase project with Auth + Firestore enabled, a Cloudinary account.

```bash
git clone https://github.com/armansinghh/buzz-social.git
cd buzz-social
npm install
```

Create a `.env` file in the project root (see `.env.example`):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

```bash
npm run dev
```

**Firebase setup:** Enable Email/Password and Google sign-in providers. Create a Firestore database and deploy the rules from `firestore.rules`.

**Cloudinary setup:** Create an unsigned upload preset and add the cloud name and preset name to your `.env`.

---

## Routing

| Path | Component | Guard |
|---|---|---|
| `/` | Home | Protected |
| `/explore` | Explore | Protected |
| `/search` | Search | Protected |
| `/profile/:id` | Profile (by username or uid) | Protected |
| `/post/:id` | Post detail | Protected |
| `/auth` | Login / Sign up | Public |
| `/onboarding` | Username setup | Public |
| `*` | 404 | Public |

Protected routes redirect to `/auth` if unauthenticated, or to `/onboarding` if no username is set. An explicit connection error screen (with retry) is shown if the profile fetch fails — it never silently redirects.

---

## What I'd improve

**Real-time updates** — The feed and notifications currently require a page refresh to show new content. Replacing `getDocs` with `onSnapshot` listeners is the natural next step; I deferred it to avoid the complexity of unsubscribing cleanly across context unmounts.

**Firestore security rules** — The current rules are reasonable but not airtight. I'd add server-side rate limiting on notification writes and tighter validation on comment content.

**Full-text search** — The current search is a Firestore range query on usernames and a client-side caption filter. For real search, Algolia or Typesense with a Cloud Function indexer is the right approach.

**Post deletion cleanup** — Deleting a post removes the Firestore document but leaves orphaned media in Cloudinary and stale like/comment notifications pointing at a non-existent post. A Cloud Function triggered on delete would clean these up.

**Comment count as a separate field** — Storing comments as an array in the post document means every comment write rewrites the entire array. At scale (>100 comments per post) this becomes a write bottleneck. A `commentCount` field updated with `increment()` and a `comments` subcollection is the right schema.

---

## v2 roadmap

A planned v2 migration to **Next.js 15 (App Router) + Supabase (Postgres)** is scoped for after v1 ships, motivated by portfolio value and the need for public profile pages with proper SEO. Key additions: SSR/SSG for public routes, Row Level Security policies replacing Firestore rules, full SQL schema with proper foreign keys, and realtime features via Supabase Realtime.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full history of releases.

---

## License

[MIT](LICENSE) © 2026 Arman Singh

---