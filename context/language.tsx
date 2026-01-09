"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "th";

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple dictionary for translations
const translations = {
    en: {
        // Navigation
        "nav.home": "Home",
        "nav.dashboard": "Dashboard",
        "nav.trucks": "Truck",
        "nav.users": "Users",
        "nav.drivers": "Drivers",
        "nav.packages": "Packages",
        "nav.analytics": "Analytics",
        "nav.settings": "Settings",
        "nav.login": "Login",
        "nav.register": "Register",
        "nav.logout": "Logout",
        "nav.myAccount": "My Account",
        "nav.myFavorite": "My Favorite",
        "nav.adminDashboard": "Admin Dashboard",
        "nav.propertyStockSearch": "Property stock search",

        // Home
        "home.welcome": "Welcome to Fire Home Course",

        // Auth
        "auth.login.title": "Login",
        "auth.login.subtitle": "Enter your email below to login to your account",
        "auth.register.title": "Create an Account",
        "auth.register.subtitle": "Enter your information to create your account",
        "auth.email": "Email",
        "auth.password": "Password",
        "auth.confirmPassword": "Confirm Password",
        "auth.forgotPassword": "Forgot your password?",
        "auth.or": "or",
        "auth.dontHaveAccount": "Don't have an account? Sign Up",
        "auth.alreadyHaveAccount": "Already have an account? Sign In",
        "auth.passwordsDoNotMatch": "Passwords do not match",
        "auth.passwordMinLength": "Password must be at least 6 characters",
        "auth.creatingAccount": "Creating Account...",
        "auth.signUp": "Sign Up",
        "auth.signIn": "Sign In",

        // Admin Panel
        "admin.panel": "Admin Panel",

        // Dashboard
        "dashboard.title": "Admin Dashboard",
        "dashboard.subtitle": "Manage your logistics operations",
        "dashboard.manageUsers": "Manage Users",
        "dashboard.manageUsersDesc": "View and manage user accounts",
        "dashboard.manageDrivers": "Manage Drivers",
        "dashboard.manageDriversDesc": "View and manage driver accounts",
        "dashboard.managePackages": "Manage Packages",
        "dashboard.managePackagesDesc": "View and manage package deliveries",
        "dashboard.manageTrucks": "Manage Trucks",
        "dashboard.manageTrucksDesc": "View and manage truck fleet",
        "dashboard.analytics": "Analytics",
        "dashboard.analyticsDesc": "View delivery statistics and reports",

        // Trucks
        "trucks.title": "Trucks",
        "trucks.subtitle": "Manage your truck fleet",
        "trucks.addTruck": "Add Truck",
        "trucks.searchPlaceholder": "Search trucks...",
        "trucks.noTrucks": "No trucks yet",
        "trucks.getStarted": "Get started by adding your first truck.",
        "trucks.status.available": "Available",
        "trucks.status.inTransit": "In Transit",
        "trucks.status.maintenance": "Maintenance",

        // Common
        "common.loading": "Loading...",
    },
    th: {
        // Navigation
        "nav.home": "หน้าแรก",
        "nav.dashboard": "แดชบอร์ด",
        "nav.trucks": "รถบรรทุก",
        "nav.users": "ผู้ใช้งาน",
        "nav.drivers": "คนขับรถ",
        "nav.packages": "พัสดุ",
        "nav.analytics": "วิเคราะห์ข้อมูล",
        "nav.settings": "ตั้งค่า",
        "nav.login": "เข้าสู่ระบบ",
        "nav.register": "สมัครสมาชิก",
        "nav.logout": "ออกจากระบบ",
        "nav.myAccount": "บัญชีของฉัน",
        "nav.myFavorite": "รายการโปรด",
        "nav.adminDashboard": "แดชบอร์ดผู้ดูแล",
        "nav.propertyStockSearch": "ค้นหาคลังสินค้า",

        // Home
        "home.welcome": "ยินดีต้อนรับสู่ Fire Home Course",

        // Auth
        "auth.login.title": "เข้าสู่ระบบ",
        "auth.login.subtitle": "กรอกอีเมลด้านล่างเพื่อเข้าสู่ระบบ",
        "auth.register.title": "สร้างบัญชีผู้ใช้",
        "auth.register.subtitle": "กรอกข้อมูลของคุณเพื่อสร้างบัญชี",
        "auth.email": "อีเมล",
        "auth.password": "รหัสผ่าน",
        "auth.confirmPassword": "ยืนยันรหัสผ่าน",
        "auth.forgotPassword": "ลืมรหัสผ่าน?",
        "auth.or": "หรือ",
        "auth.dontHaveAccount": "ไม่มีบัญชี? สมัครสมาชิก",
        "auth.alreadyHaveAccount": "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ",
        "auth.passwordsDoNotMatch": "รหัสผ่านไม่ตรงกัน",
        "auth.passwordMinLength": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        "auth.creatingAccount": "กำลังสร้างบัญชี...",
        "auth.signUp": "สมัครสมาชิก",
        "auth.signIn": "เข้าสู่ระบบ",

        // Admin Panel
        "admin.panel": "แผงควบคุมผู้ดูแล",

        // Dashboard
        "dashboard.title": "แดชบอร์ดผู้ดูแล",
        "dashboard.subtitle": "จัดการการดำเนินงานโลจิสติกส์ของคุณ",
        "dashboard.manageUsers": "จัดการผู้ใช้งาน",
        "dashboard.manageUsersDesc": "ดูและจัดการบัญชีผู้ใช้งาน",
        "dashboard.manageDrivers": "จัดการคนขับรถ",
        "dashboard.manageDriversDesc": "ดูและจัดการบัญชีคนขับรถ",
        "dashboard.managePackages": "จัดการพัสดุ",
        "dashboard.managePackagesDesc": "ดูและจัดการการจัดส่งพัสดุ",
        "dashboard.manageTrucks": "รถบรรทุก",
        "dashboard.manageTrucksDesc": "ดูและจัดการกองรถบรรทุก",
        "dashboard.analytics": "วิเคราะห์ข้อมูล",
        "dashboard.analyticsDesc": "ดูสถิติและรายงานการจัดส่ง",

        // Trucks
        "trucks.title": "รถบรรทุก",
        "trucks.subtitle": "จัดการกองรถบรรทุกของคุณ",
        "trucks.addTruck": "เพิ่มรถบรรทุก",
        "trucks.searchPlaceholder": "ค้นหารถบรรทุก...",
        "trucks.noTrucks": "ยังไม่มีรถบรรทุก",
        "trucks.getStarted": "เริ่มต้นด้วยการเพิ่มรถบรรทุกคันแรกของคุณ",
        "trucks.status.available": "ว่าง",
        "trucks.status.inTransit": "กำลังส่งของ",
        "trucks.status.maintenance": "ซ่อมบำรุง",

        // Common
        "common.loading": "กำลังโหลด...",
    },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    useEffect(() => {
        const savedLanguage = localStorage.getItem("language") as Language;
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations["en"]] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
