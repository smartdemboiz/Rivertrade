"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function SiteHeader({ landing = false }) {
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const aboutActive = pathname === "/about";
  const contactActive = pathname === "/contact";
  const activeLinkClass = "header-active-link transition-opacity hover:opacity-90";
  const standardLinkClass = "transition-opacity hover:opacity-90";
  const languages = [
    ["GB", "en", "English"],
    ["ES", "es", "Español"],
    ["FR", "fr", "Français"],
    ["DE", "de", "Deutsch"],
    ["PT", "pt", "Português"],
    ["JP", "ja", "日本語"],
    ["CN", "zh", "中文"],
  ];

  const selectLanguage = (value) => {
    setLanguage(value);
    setLanguageOpen(false);
  };

  return (
    <header className={`site-header ${landing ? "landing-header" : "internal-header"} sticky top-0 z-50 flex h-[70px] items-center justify-between border border-zinc-700 px-4 text-sm font-bold text-zinc-100 md:px-5`}>
      {landing && (
        <Link className="landing-brand flex items-center shrink-0" href="/" aria-label="RiverTrade home">
          <img
            className="h-10 w-auto max-w-40"
            src="/icoinred/logo-88256519050c5e84fcbd2120a81b2097.svg"
            alt="RiverTrade"
          />
        </Link>
      )}

      <div className={`${landing ? "landing-nav" : "internal-nav"} hidden items-center gap-7 md:flex ${landing ? "md:ml-auto" : "md:mx-auto"}`}>
        {landing ? (
          <>
            <div className="relative">
              <button type="button" className="flex items-center gap-1 transition-opacity hover:opacity-90" onClick={() => setAboutOpen(!aboutOpen)} aria-expanded={aboutOpen}>
                {t("about")} <ChevronDown size={16} className={aboutOpen ? "rotate-180" : ""} />
              </button>
              {aboutOpen && (
                <div className="absolute right-0 top-full mt-4 w-52 rounded-md border border-zinc-700 bg-[#2f2f2f] p-3 shadow-2xl shadow-black/30">
                  <div className="grid gap-1">
                    <Link href="/about" className="rounded px-2 py-2 text-left text-white hover:bg-white/5" onClick={() => setAboutOpen(false)}>{t("aboutUs")}</Link>
                    <Link href="/contact" className="rounded px-2 py-2 text-left text-white hover:bg-white/5" onClick={() => setAboutOpen(false)}>{t("contactUs")}</Link>
                    <Link href="/about#company" className="rounded px-2 py-2 text-left text-white hover:bg-white/5" onClick={() => setAboutOpen(false)}>{t("companyInfo")}</Link>
                  </div>
                </div>
              )}
            </div>
            <div className="language-picker">
              <button className={`language-trigger ${languageOpen ? "is-open" : ""}`} type="button" aria-label={`${t("language")}: ${language.toUpperCase()}`} aria-expanded={languageOpen} onClick={() => setLanguageOpen(!languageOpen)}>
                <span className="language-code">{language.toUpperCase()}</span>
                <ChevronDown size={13} className={languageOpen ? "rotate-180" : ""} />
              </button>
              {languageOpen && (
                <div className="language-menu">
                  <div className="language-menu-head"><span>{t("language")}</span><small>{language.toUpperCase()} selected</small></div>
                  {languages.map(([code, value, label]) => (
                    <button key={code} type="button" className={language === value ? "selected" : ""} onClick={() => selectLanguage(value)}>
                      <small>{code}</small><span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/" className="transition-opacity hover:opacity-90">{t("home")}</Link>
            <Link href="/about" className={aboutActive ? activeLinkClass : standardLinkClass}>{t("about")}</Link>
            <Link href="/contact" className={contactActive ? activeLinkClass : standardLinkClass}>{t("contact")}</Link>
          </>
        )}
      </div>

      <div className={`${landing ? "landing-actions" : "internal-actions"} hidden items-center gap-4 md:flex ${landing ? "md:pl-6" : "md:ml-auto md:pl-6"}`}>
        <Link href="/auth?mode=login" className="transition-opacity hover:opacity-90">{landing ? t("login") : t("login")}</Link>
        <Link href="/auth?mode=register" className={landing ? "text-[#f0d8d8] transition-opacity hover:opacity-90" : "rounded-full bg-[#d06552] px-4 py-2 text-white transition-opacity hover:opacity-90"}>
          {t("signUp")}
        </Link>
      </div>

      <nav
        className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-[70px] flex-col gap-5 border-b border-zinc-700 bg-[#0b1020] px-5 py-6 text-white md:hidden`}
      >
        {!landing && <Link href="/" onClick={() => setOpen(false)}>{t("home")}</Link>}
        <button type="button" className="flex items-center justify-between text-left" onClick={() => setAboutOpen(!aboutOpen)} aria-expanded={aboutOpen}>
          {t("about")} <ChevronDown size={16} className={aboutOpen ? "rotate-180" : ""} />
        </button>
        {aboutOpen && (
          <div className="flex flex-col gap-3 pl-3 text-sm text-zinc-200">
            <Link href="/about" onClick={() => { setAboutOpen(false); setOpen(false); }}>{t("aboutUs")}</Link>
            <Link href="/contact" onClick={() => { setAboutOpen(false); setOpen(false); }}>{t("contactUs")}</Link>
            <Link href="/about#company" onClick={() => { setAboutOpen(false); setOpen(false); }}>{t("companyInfo")}</Link>
          </div>
        )}
        {!landing && <Link href="/contact" onClick={() => setOpen(false)}>{t("contact")}</Link>}
        <div className="mobile-language-picker">
          <button type="button" className="flex items-center gap-2 text-left" onClick={() => setLanguageOpen(!languageOpen)} aria-expanded={languageOpen}>
            {t("language")}
          </button>
          {languageOpen && (
            <div className="flex flex-col gap-3 pl-7 text-sm text-zinc-200">
              {languages.map(([code, value, label]) => (
                <button key={code} type="button" className="flex gap-2 text-left" onClick={() => { selectLanguage(value); setOpen(false); }}>
                  <small>{code}</small><span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <Link href="/auth?mode=login" onClick={() => setOpen(false)}>{t("login")}</Link>
        <Link href="/auth?mode=register" onClick={() => setOpen(false)}>{t("signUp")}</Link>
      </nav>

      <button
        className="grid place-items-center border-0 bg-transparent text-white md:hidden"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
