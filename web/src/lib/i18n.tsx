"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "fr" | "ar";

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  en: {
    "nav.home": "Home",
    "nav.shop": "Shop",
    "nav.sale": "Sale",
    "nav.about": "About us",
    "nav.cart": "Cart",
    "auth.login": "Login",
    "auth.signup": "Sign up",
    "auth.logout": "Logout",
    "auth.account": "Account",
    "auth.admin": "Admin",
    "login.title": "Login",
    "signup.title": "Sign up",
    "signup.button": "Create account",
    "hero.badge": "New collection 2026",
    "hero.title": "Where modern modesty meets elevated design.",
    "hero.subtitle":
      "Fluid silhouettes, tactile fabrics, and refined details — curated for everyday elegance.",
    "hero.cta.primary": "Shop new arrivals",
    "hero.cta.secondary": "About Lumi Noir",
    "empty.products": "No products yet. Add items in the admin panel to see them here.",
    "cart.title": "Cart",
    "cart.empty": "Your cart is empty.",
    "cart.checkout": "Checkout",
    "checkout.title": "Checkout",
    "checkout.place": "Place order",
    "checkout.placing": "Placing order...",
    "checkout.note": "(Payment integration later — this creates an order in DB.)",
    "order.placed": "Order placed",
    "order.id": "Order ID",
    "admin.products": "Products",
    "admin.add": "Add product",
    "admin.edit": "Edit",
    "admin.only": "Admin only",
    "admin.only.note": "You must be an admin to manage products.",
    "about.default":
      "Modern abayas with refined details, crafted for everyday elegance.",
    "related.title": "You may also like",
    "home.hero": "A signature line of abayas, designed to feel unmistakably yours.",
    "home.sub":
      "Minimal, refined, and confident. Tailored silhouettes with a modern, modest edge.",
    "home.cta": "Shop the collection",
    "home.hero.empty": "Add a featured product to show the hero image.",
    "home.featured": "Featured",
    "home.empty": "No products yet. Add items in the admin panel to feature them here.",
    "home.about":
      "Lumi Noir is a quiet statement of strength — modern abayas crafted for elegance and ease.",
    "home.footer": "Lumi Noir",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.shop": "Boutique",
    "nav.sale": "Promos",
    "nav.about": "À propos",
    "nav.cart": "Panier",
    "auth.login": "Connexion",
    "auth.signup": "S’inscrire",
    "auth.logout": "Se déconnecter",
    "auth.account": "Compte",
    "auth.admin": "Admin",
    "login.title": "Connexion",
    "signup.title": "S’inscrire",
    "signup.button": "Créer un compte",
    "hero.badge": "Nouvelle collection 2026",
    "hero.title": "L’élégance moderne au cœur du modest fashion.",
    "hero.subtitle":
      "Silhouettes fluides, matières tactiles et détails raffinés — pour une élégance au quotidien.",
    "hero.cta.primary": "Voir les nouveautés",
    "hero.cta.secondary": "À propos de Lumi Noir",
    "empty.products":
      "Aucun produit pour le moment. Ajoutez des articles dans l’espace admin pour les afficher ici.",
    "cart.title": "Panier",
    "cart.empty": "Votre panier est vide.",
    "cart.checkout": "Paiement",
    "checkout.title": "Paiement",
    "checkout.place": "Passer la commande",
    "checkout.placing": "Commande en cours...",
    "checkout.note":
      "(Intégration du paiement plus tard — cela crée une commande dans la base.)",
    "order.placed": "Commande validée",
    "order.id": "ID de commande",
    "admin.products": "Produits",
    "admin.add": "Ajouter un produit",
    "admin.edit": "Modifier",
    "admin.only": "Accès admin",
    "admin.only.note": "Vous devez être administrateur pour gérer les produits.",
    "about.default":
      "Des abayas modernes aux détails raffinés, pensées pour l’élégance au quotidien.",
    "related.title": "Vous aimerez aussi",
    "home.hero":
      "Une signature d’abayas pensée pour vous ressembler, en toute élégance.",
    "home.sub":
      "Minimaliste, raffinée, assurée. Des silhouettes modernes, modestes, et affirmées.",
    "home.cta": "Voir la collection",
    "home.hero.empty": "Ajoutez un produit vedette pour afficher l’image principale.",
    "home.featured": "Sélection",
    "home.empty":
      "Aucun produit pour le moment. Ajoutez des articles dans l’espace admin pour les afficher ici.",
    "home.about":
      "Lumi Noir est une signature discrète de force — des abayas modernes pour l’élégance et le confort.",
    "home.footer": "Lumi Noir",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.shop": "المتجر",
    "nav.sale": "تخفيضات",
    "nav.about": "من نحن",
    "nav.cart": "السلة",
    "auth.login": "تسجيل الدخول",
    "auth.signup": "إنشاء حساب",
    "auth.logout": "تسجيل الخروج",
    "auth.account": "الحساب",
    "auth.admin": "الإدارة",
    "login.title": "تسجيل الدخول",
    "signup.title": "إنشاء حساب",
    "signup.button": "إنشاء حساب",
    "hero.badge": "تشكيلة جديدة 2026",
    "hero.title": "أناقة محتشمة بروح عصرية.",
    "hero.subtitle":
      "قصّات انسيابية، خامات فاخرة، وتفاصيل راقية — مختارة للأناقة اليومية.",
    "hero.cta.primary": "تسوقي الجديد",
    "hero.cta.secondary": "عن لومي نوير",
    "empty.products": "لا توجد منتجات بعد. أضيفي المنتجات من لوحة الإدارة لتظهر هنا.",
    "cart.title": "السلة",
    "cart.empty": "سلتك فارغة.",
    "cart.checkout": "إتمام الشراء",
    "checkout.title": "الدفع",
    "checkout.place": "تأكيد الطلب",
    "checkout.placing": "جارٍ تأكيد الطلب...",
    "checkout.note": "(سيتم إضافة الدفع لاحقاً — هذا ينشئ الطلب في قاعدة البيانات.)",
    "order.placed": "تم تأكيد الطلب",
    "order.id": "رقم الطلب",
    "admin.products": "المنتجات",
    "admin.add": "إضافة منتج",
    "admin.edit": "تعديل",
    "admin.only": "للإدارة فقط",
    "admin.only.note": "يجب أن تكوني مشرفة لإدارة المنتجات.",
    "about.default": "عبايات عصرية بتفاصيل راقية، مصممة لأناقة يومية.",
    "related.title": "قد يعجبك أيضاً",
    "home.hero": "خط عبايات بتوقيع مميز، صُمم ليعبر عنك.",
    "home.sub":
      "بساطة راقية وثقة هادئة. قصات عصرية محتشمة بلمسة فاخرة.",
    "home.cta": "تسوقي التشكيلة",
    "home.hero.empty": "أضيفي منتجاً مميزاً لعرض الصورة الرئيسية.",
    "home.featured": "مختارات",
    "home.empty": "لا توجد منتجات بعد. أضيفي المنتجات من لوحة الإدارة لتظهر هنا.",
    "home.about":
      "لومي نوير رسالة هادئة للقوة — عبايات عصرية تجمع الأناقة والراحة.",
    "home.footer": "Lumi Noir",
  },
};

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("lumi_lang") as Language | null;
  if (stored && ["en", "fr", "ar"].includes(stored)) return stored;
  const nav = window.navigator.language.toLowerCase();
  if (nav.startsWith("ar")) return "ar";
  if (nav.startsWith("fr")) return "fr";
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(detectLanguage());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("lumi_lang", lang);
    const root = document.documentElement;
    root.lang = lang;
    root.classList.toggle("lang-ar", lang === "ar");
  }, [lang]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      lang,
      setLang,
      t: (key: string) => dictionaries[lang][key] || dictionaries.en[key] || key,
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
