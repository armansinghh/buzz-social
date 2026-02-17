# Buzz

A modern social media application built with React, TypeScript, and Vite.

> What’s buzzing right now.

Buzz is a structured, scalable social media frontend built with production-ready architecture.  
The project focuses on clean layout systems, modular feature organization, and real-world app patterns rather than tutorial-style shortcuts.

---

## ✨ Current Features

- 🔐 Authentication flow (Login / Logout)
- 🌐 Context-based global auth state
- 🧭 React Router v6 routing architecture
- 🧱 3-column social layout
  - Fixed top navigation
  - Left navigation sidebar
  - Scrollable middle feed
  - Right sidebar (suggested users)
- 🎨 Tailwind CSS styling
- 🖼 FontAwesome icon integration
- 📱 Responsive layout (desktop-first, mobile-aware)
- 📦 Clean project structure for scalability

---

## 🧠 Architecture Highlights

- **Layout responsibility separation**
  - AppLayout controls structure
  - Sidebar/Navbar control content only
- **Scrollable feed isolation**
  - Only the middle section scrolls
  - No body scroll
- **Auth Context pattern**
  - Centralized user state
  - Reactive Navbar updates
- **Scalable folder structure**
  - Feature-based organization

---

## 🛠 Tech Stack

- React
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- FontAwesome
- Context API

---

## 📁 Project Structure

```

src/
├── app/                # App bootstrap + router
├── components/         # Reusable UI components
│   ├── layout/         # AppLayout, Navbar, Sidebars
│   └── ...
├── features/
│   └── auth/           # Auth context & logic
├── pages/              # Route-level pages
├── styles/
└── main.tsx

```

---

## 🚀 Getting Started

Clone the repository:

```

git clone [https://github.com/armansinghh/buzz-social.git](https://github.com/armansinghh/buzz-social.git)
cd buzz-social

```

Install dependencies:

```

npm install

```

Run development server:

```

npm run dev

```

---

## 🔑 Demo Credentials

For local testing:

```

Email: [testuser]
Password: 123456

```

---

## 🧭 Roadmap

Planned improvements:

- Persist auth state (localStorage)
- Protected route system
- Post creation system
- Post feed with mock data
- Like & comment system
- Follow/unfollow functionality
- Firebase backend integration
- Notification system
- Dark mode
- Deployment (Vercel)

---

## 🎯 Goals of This Project

Buzz is not just a UI demo.

It is built to:
- Demonstrate frontend architecture discipline
- Follow scalable layout patterns
- Apply real-world React patterns
- Serve as a portfolio-ready application

---

## 📜 License


This project is licensed under the MIT License.


---
Made with ❤️
by Arman Singh