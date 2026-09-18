"use client";

import { createContext, useContext, useEffect, useState } from "react";

const translations = {
  en: { dashboard: "Dashboard", customers: "Customers", kyc: "KYC management", transactions: "Transactions", investments: "Investments", userFunds: "Manage User Funds", expertTraders: "Manage Expert Traders", swaps: "Swap activity", managedAccounts: "Managed accounts", deposits: "Deposits", withdrawals: "Withdrawals", investmentPlans: "Investment plans", profitHistory: "Profit history", profiles: "Profiles", referrals: "Referrals", support: "Support", paymentSettings: "Payment details", manageSchema: "Manage Schema", schedule: "Schedule", holiday: "Holiday", editInvestmentPlans: "Edit Investment Plans", staff: "Staff management", settings: "Settings", welcome: "Welcome back. Here is what is happening with your platform today.", home: "Home", about: "About", contact: "Contact", login: "Login", signUp: "Sign Up", aboutUs: "About Us", contactUs: "Contact Us", companyInfo: "Company Info", language: "Language", contactEyebrow: "We're Here For You", getIn: "Get In", touch: "Touch", contactLead: "Have questions or need assistance? Our team is available 24/7 to help you." },
  es: { dashboard: "Panel", customers: "Clientes", kyc: "Gestión KYC", transactions: "Transacciones", investments: "Inversiones", userFunds: "Gestionar fondos de usuarios", expertTraders: "Gestionar traders expertos", manageSchema: "Gestionar esquema", schedule: "Programación", holiday: "Festivo", editInvestmentPlans: "Editar planes de inversión", staff: "Gestión de personal", settings: "Configuración", welcome: "Bienvenido. Esto es lo que sucede hoy en tu plataforma.", home: "Inicio", about: "Acerca de", contact: "Contacto", login: "Iniciar sesión", signUp: "Registrarse", aboutUs: "Sobre nosotros", contactUs: "Contáctanos", companyInfo: "Información de la empresa", language: "Idioma", contactEyebrow: "Estamos aquí para ayudarte", getIn: "Ponte en", touch: "Contacto", contactLead: "¿Tienes preguntas? Nuestro equipo está disponible 24/7 para ayudarte." },
  fr: { dashboard: "Tableau de bord", customers: "Clients", kyc: "Gestion KYC", transactions: "Transactions", investments: "Investissements", userFunds: "Gérer les fonds utilisateurs", expertTraders: "Gérer les traders experts", manageSchema: "Gérer le schéma", schedule: "Planning", holiday: "Jour férié", editInvestmentPlans: "Modifier les plans d'investissement", staff: "Gestion du personnel", settings: "Paramètres", welcome: "Bienvenue. Voici ce qui se passe sur votre plateforme aujourd'hui.", home: "Accueil", about: "À propos", contact: "Contact", login: "Connexion", signUp: "S'inscrire", aboutUs: "À propos de nous", contactUs: "Nous contacter", companyInfo: "Informations sur l'entreprise", language: "Langue", contactEyebrow: "Nous sommes là pour vous", getIn: "Prenez", touch: "Contact", contactLead: "Des questions ? Notre équipe est disponible 24h/24 et 7j/7 pour vous aider." },
  de: { dashboard: "Dashboard", customers: "Kunden", kyc: "KYC-Verwaltung", transactions: "Transaktionen", investments: "Investitionen", userFunds: "Benutzerfonds verwalten", expertTraders: "Expertenhändler verwalten", manageSchema: "Schema verwalten", schedule: "Zeitplan", holiday: "Feiertag", editInvestmentPlans: "Anlagepläne bearbeiten", staff: "Mitarbeiter", settings: "Einstellungen", welcome: "Willkommen zurück. Das passiert heute auf Ihrer Plattform.", home: "Startseite", about: "Über uns", contact: "Kontakt", login: "Anmelden", signUp: "Registrieren", aboutUs: "Über uns", contactUs: "Kontaktieren Sie uns", companyInfo: "Unternehmensinfo", language: "Sprache", contactEyebrow: "Wir sind für Sie da", getIn: "Kontakt", touch: "aufnehmen", contactLead: "Fragen? Unser Team ist rund um die Uhr für Sie da." },
  pt: { dashboard: "Painel", customers: "Clientes", kyc: "Gestão KYC", transactions: "Transações", investments: "Investimentos", userFunds: "Gerenciar fundos do usuário", expertTraders: "Gerenciar traders especialistas", manageSchema: "Gerenciar esquema", schedule: "Cronograma", holiday: "Feriado", editInvestmentPlans: "Editar planos de investimento", staff: "Equipe", settings: "Configurações", welcome: "Bem-vindo. Veja o que acontece hoje na sua plataforma.", home: "Início", about: "Sobre", contact: "Contato", login: "Entrar", signUp: "Cadastrar", aboutUs: "Sobre nós", contactUs: "Fale conosco", companyInfo: "Informações da empresa", language: "Idioma", contactEyebrow: "Estamos aqui para você", getIn: "Entre em", touch: "contato", contactLead: "Tem dúvidas? Nossa equipe está disponível 24 horas por dia." },
  ja: { dashboard: "ダッシュボード", customers: "顧客", kyc: "KYC管理", transactions: "取引", investments: "投資", userFunds: "ユーザー資金を管理", expertTraders: "専門トレーダーを管理", manageSchema: "スキーマ管理", schedule: "スケジュール", holiday: "休日", editInvestmentPlans: "投資プランを編集", staff: "スタッフ", settings: "設定", welcome: "おかえりなさい。今日のプラットフォーム情報です。", home: "ホーム", about: "概要", contact: "お問い合わせ", login: "ログイン", signUp: "登録", aboutUs: "私たちについて", contactUs: "お問い合わせ", companyInfo: "会社情報", language: "言語", contactEyebrow: "あなたのために", getIn: "お問い合わせ", touch: "ください", contactLead: "ご質問がありますか？チームが24時間対応します。" },
  zh: { dashboard: "仪表盘", customers: "客户", kyc: "KYC管理", transactions: "交易", investments: "投资", userFunds: "管理用户资金", expertTraders: "管理专家交易员", manageSchema: "管理模式", schedule: "日程", holiday: "假期", editInvestmentPlans: "编辑投资计划", staff: "员工", settings: "设置", welcome: "欢迎回来。这是平台今天的动态。", home: "首页", about: "关于", contact: "联系", login: "登录", signUp: "注册", aboutUs: "关于我们", contactUs: "联系我们", companyInfo: "公司信息", language: "语言", contactEyebrow: "我们随时为您服务", getIn: "联系我们", touch: "", contactLead: "有问题吗？我们的团队全天候为您提供帮助。" },
};

const interfaceTranslations = {
  en: { notifications: "Notifications", markAllRead: "Clear all", noNotifications: "No new notifications" },
  es: { notifications: "Notificaciones", markAllRead: "Borrar todas", noNotifications: "No hay notificaciones nuevas" },
  fr: { notifications: "Notifications", markAllRead: "Tout effacer", noNotifications: "Aucune nouvelle notification" },
  de: { notifications: "Benachrichtigungen", markAllRead: "Alle löschen", noNotifications: "Keine neuen Benachrichtigungen" },
  pt: { notifications: "Notificações", markAllRead: "Limpar tudo", noNotifications: "Nenhuma notificação nova" },
  ja: { notifications: "通知", markAllRead: "すべて消去", noNotifications: "新しい通知はありません" },
  zh: { notifications: "通知", markAllRead: "清除全部", noNotifications: "没有新通知" },
};

const LanguageContext = createContext({ language: "en", setLanguage: () => {}, t: key => translations.en[key] || key });
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    const savedLanguage = localStorage.getItem("rivertrade-language");
    return savedLanguage && translations[savedLanguage] ? savedLanguage : "en";
  });
  const changeLanguage = value => {
    setLanguage(value);
    if (typeof window !== "undefined") localStorage.setItem("rivertrade-language", value);
  };
  const t = key => translations[language]?.[key] || interfaceTranslations[language]?.[key] || translations.en[key] || interfaceTranslations.en[key] || key;
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
