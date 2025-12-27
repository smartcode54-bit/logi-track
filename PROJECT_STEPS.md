# Fire Home Course - Project Steps Guide

## 📋 Table of Contents
1. [Project Setup](#1-project-setup)
2. [Navigation Bar](#2-navigation-bar)
3. [Firebase Configuration](#3-firebase-configuration)
4. [Login Page with Google Auth](#4-login-page-with-google-auth)
5. [Context API for Authentication](#5-context-api-for-authentication)
6. [Display User Info in Navbar](#6-display-user-info-in-navbar)
7. [Dark/Light Mode Toggle](#7-darklight-mode-toggle)

---

## 1. Project Setup

### Step 1.1: Initialize Next.js Project
```bash
npx create-next-app@latest fire-home-course
```

### Step 1.2: Install Firebase
```bash
npm install firebase
```

### Step 1.3: Project Structure
```
fire-home-course/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── (auth)/
│       ├── login/
│       │   └── page.tsx
│       └── register/
│           └── page.tsx
├── components/
│   ├── navigation.tsx
│   └── continue-with-google-button.tsx
├── context/
│   └── auth.tsx
├── firebase/
│   ├── client.ts
│   └── server.ts
└── lib/
    └── utils.ts
```

---

## 2. Navigation Bar

### Step 2.1: Create Navigation Component

**File:** `components/navigation.tsx`

```tsx
"use client";

import Link from "next/link";
import { auth } from "@/firebase/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-green-800 text-white p-4">
      <div className="w-full flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold">
          Fire Home
        </Link>
        
        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-sm">Loading...</span>
          ) : user ? (
            <button
              onClick={handleLogout}
              className="text-sm hover:underline"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:underline">
                Login
              </Link>
              <span className="text-sm">|</span>
              <Link href="/register" className="text-sm hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

**Key Points:**
- ✅ "Fire Home" ชิดซ้าย
- ✅ "Login | Register" หรือ "Logout" ชิดขวา
- ✅ ใช้ `onAuthStateChanged` เพื่อตรวจสอบสถานะ login
- ✅ Cleanup subscription ใน `useEffect`

### Step 2.2: Update Home Page

**File:** `app/page.tsx`

```tsx
import Navigation from "@/components/navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Fire Home Course
          </h1>
          <p className="text-lg text-muted-foreground">
            Your logistics tracking solution
          </p>
        </div>
      </main>
    </div>
  );
}
```

**Key Points:**
- ✅ ใช้ `flex flex-col` สำหรับ layout
- ✅ ใช้ `flex-1 flex items-center justify-center` เพื่อให้เนื้อหาอยู่กึ่งกลาง

---

## 3. Firebase Configuration

### Step 3.1: Create Firebase Client

**File:** `firebase/client.ts`

```tsx
import { initializeApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFirestore, Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const currentApps = getApps();
let auth: Auth;
let storage: FirebaseStorage;
let db: Firestore;

if (!currentApps.length) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
} else {
  const app = currentApps[0];
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
}

export { auth, storage, db };
```

**Key Points:**
- ✅ ตรวจสอบว่า Firebase ถูก initialize แล้วหรือยัง
- ✅ Export `auth`, `storage`, `db` สำหรับใช้ใน Client Components
- ✅ ใช้ environment variables สำหรับ config

### Step 3.2: Environment Variables

**File:** `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 4. Login Page with Google Auth

### Step 4.1: Create Continue with Google Button

**File:** `components/continue-with-google-button.tsx`

```tsx
"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ContinueWithGoogleButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // User signed in successfully
      console.log("Signed in:", result.user);
      router.push("/");
    } catch (error: any) {
      console.error("Error signing in:", error);
      
      // Handle specific errors
      if (error.code === "auth/popup-closed-by-user") {
        alert("Sign in was cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        alert("Popup was blocked. Please allow popups for this site.");
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3"
      variant="outline"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        {/* Google Logo SVG */}
      </svg>
      {loading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
```

**Key Points:**
- ✅ ใช้ `signInWithPopup` สำหรับ Google authentication
- ✅ Handle errors อย่างเหมาะสม
- ✅ Show loading state
- ✅ Redirect ไปหน้า home หลัง login สำเร็จ

### Step 4.2: Create Login Page

**File:** `app/(auth)/login/page.tsx`

```tsx
"use client";

import Navigation from "@/components/navigation";
import ContinueWithGoogleButton from "@/components/continue-with-google-button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Login
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          <div className="space-y-4">
            <ContinueWithGoogleButton />
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Key Points:**
- ✅ ใช้ `flex flex-col` สำหรับ layout
- ✅ ใช้ `flex-1 flex items-center justify-center` เพื่อให้ modal อยู่กึ่งกลางทั้งแนวนอนและแนวตั้ง
- ✅ Modal จะอยู่กึ่งกลางหน้าจอเสมอ

---

## 5. Context API for Authentication

### Step 5.1: Create Auth Context

**File:** `context/auth.tsx`

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

type AuthContextType = {
  currentUser: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Key Points:**
- ✅ ใช้ `createContext` เพื่อสร้าง Context
- ✅ ระบุ TypeScript type: `AuthContextType | null`
- ✅ ใช้ `onAuthStateChanged` เพื่อ listen auth state
- ✅ Export `useAuth` hook สำหรับใช้ใน components

### Step 5.2: Wrap App with AuthProvider

**File:** `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = theme === 'dark' || (!theme && prefersDark);
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Key Points:**
- ✅ Wrap `{children}` ด้วย `<AuthProvider>`
- ✅ ทำให้ทุก component ใน app สามารถใช้ `useAuth()` ได้

---

## 6. Display User Info in Navbar

### Step 6.1: Update Navigation to Use Context

**File:** `components/navigation.tsx`

```tsx
"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navigation() {
  const authContext = useAuth();
  const router = useRouter();
  const currentUser = authContext?.currentUser;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    // Apply theme immediately
    const html = document.documentElement;
    if (shouldBeDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    const html = document.documentElement;
    if (newIsDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Force re-render to update all components
    window.dispatchEvent(new Event('themechange'));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-green-800 text-white p-4">
      <div className="w-full flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold">
          Fire Home
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
          </button>

          {currentUser ? (
            <>
              <span className="text-sm">
                Hi, {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:underline">
                Login
              </Link>
              <span className="text-sm">|</span>
              <Link href="/register" className="text-sm hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

**Key Points:**
- ✅ ใช้ `useAuth()` จาก Context แทน `useState` และ `onAuthStateChanged`
- ✅ แสดงข้อมูลผู้ใช้ (`displayName` หรือ `email`) ก่อนปุ่ม Logout พร้อม "Hi," นำหน้า
- ✅ เพิ่ม Dark/Light Mode Toggle button
- ✅ ใช้ `lucide-react` สำหรับไอคอน Sun และ Moon
- ✅ บันทึก theme preference ใน localStorage
- ✅ ใช้ optional chaining (`?.`) เพื่อ handle null case

**ผลลัพธ์:**
- เมื่อ login แล้ว: `[ปุ่มสลับโหมด] Hi, [ชื่อผู้ใช้หรืออีเมล] Logout`
- เมื่อยังไม่ login: `[ปุ่มสลับโหมด] Login | Register`

---

## 7. Dark/Light Mode Toggle

### Step 7.1: Add Theme Toggle to Navigation

**File:** `components/navigation.tsx`

เพิ่ม Dark/Light Mode Toggle button ใน Navigation component:

```tsx
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

// Inside Navigation component
const [isDark, setIsDark] = useState(false);

useEffect(() => {
  // Check localStorage for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  setIsDark(shouldBeDark);
  // Apply theme immediately
  const html = document.documentElement;
  if (shouldBeDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}, []);

const toggleTheme = () => {
  const newIsDark = !isDark;
  setIsDark(newIsDark);
  
  const html = document.documentElement;
  if (newIsDark) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
  
  // Force re-render to update all components
  window.dispatchEvent(new Event('themechange'));
};

// In JSX
<button
  onClick={toggleTheme}
  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
>
  {isDark ? (
    <Sun className="w-5 h-5 text-white" />
  ) : (
    <Moon className="w-5 h-5 text-white" />
  )}
</button>
```

**Key Points:**
- ✅ ตรวจสอบ theme จาก localStorage และ system preference
- ✅ แสดงไอคอน Sun เมื่อเป็นโหมดมืด (คลิกเพื่อเปลี่ยนเป็นสว่าง)
- ✅ แสดงไอคอน Moon เมื่อเป็นโหมดสว่าง (คลิกเพื่อเปลี่ยนเป็นมืด)
- ✅ บันทึก theme preference ใน localStorage
- ✅ ใช้ `lucide-react` สำหรับไอคอน

**Install lucide-react:**
```bash
npm install lucide-react
```

---

## 🎯 Summary of Changes

### Before (Using useState + onAuthStateChanged)
```tsx
const [user, setUser] = useState<any>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
  });
  return () => unsubscribe();
}, []);
```

### After (Using Context API)
```tsx
const authContext = useAuth();
const currentUser = authContext?.currentUser;
```

**ข้อดีของ Context API:**
- ✅ ไม่ต้อง duplicate auth logic ในทุก component
- ✅ Auth state ถูก share ระหว่าง components
- ✅ Code สะอาดและ maintainable มากขึ้น
- ✅ ไม่ต้องจัดการ loading state ในแต่ละ component

---

## 📝 Best Practices

### 1. Context Type Safety
```tsx
// ✅ Good: ระบุ type
const AuthContext = createContext<AuthContextType | null>(null);

// ❌ Bad: ไม่ระบุ type
const AuthContext = createContext(null);
```

### 2. Handle Null Cases
```tsx
// ✅ Good: ใช้ optional chaining
const currentUser = authContext?.currentUser;

// ❌ Bad: ไม่ handle null
const currentUser = authContext.currentUser; // อาจ error
```

### 3. Cleanup Subscriptions
```tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
  });
  return () => unsubscribe(); // ✅ สำคัญ: cleanup
}, []);
```

---

## 🚀 Next Steps

1. **Protected Routes** - สร้าง middleware หรือ HOC สำหรับ protect routes
2. **User Profile** - สร้างหน้า profile สำหรับแสดงและแก้ไขข้อมูลผู้ใช้
3. **Firestore Integration** - บันทึกข้อมูลผู้ใช้ลง Firestore
4. **Role-based Access** - เพิ่ม role-based access control

---

**Last Updated:** 2025-01-27

