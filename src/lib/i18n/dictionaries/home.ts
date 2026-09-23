export const home = {
  fr: {
    kicker: "Annuaire",
    titre: "Annuaire des profils",
    sinscrire: "S'inscrire",
    aucunProfil: "Aucun profil ne correspond à ces critères.",
    pagination: (current: string, total: string, count: number) =>
      `PAGE ${current} / ${total} — ${count} PROFILS`,
    precedent: "← Précédent",
    suivant: "Suivant →",
  },
  en: {
    kicker: "Directory",
    titre: "Profile directory",
    sinscrire: "Sign up",
    aucunProfil: "No profile matches these criteria.",
    pagination: (current: string, total: string, count: number) =>
      `PAGE ${current} / ${total} — ${count} PROFILES`,
    precedent: "← Previous",
    suivant: "Next →",
  },
  zh: {
    kicker: "名录",
    titre: "档案名录",
    sinscrire: "注册",
    aucunProfil: "没有符合这些条件的档案。",
    pagination: (current: string, total: string, count: number) =>
      `第 ${current} / ${total} 页 — 共 ${count} 个档案`,
    precedent: "← 上一页",
    suivant: "下一页 →",
  },
};
