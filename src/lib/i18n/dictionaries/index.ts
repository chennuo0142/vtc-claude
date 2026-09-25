import { common } from "./common";
import { nav } from "./nav";
import { home } from "./home";
import { connexion } from "./connexion";
import { motDePasseOublie } from "./motDePasseOublie";
import { inscription } from "./inscription";
import { compteEnAttente } from "./compteEnAttente";
import { verifierEmail } from "./verifierEmail";
import { filtresBar } from "./filtresBar";
import { monProfilPage } from "./monProfilPage";
import { monProfilForm } from "./monProfilForm";
import { changerMotDePasse } from "./changerMotDePasse";
import { profilDetail } from "./profilDetail";
import { contactForm } from "./contactForm";
import { profileCard } from "./profileCard";
import { adminDashboard } from "./adminDashboard";
import { adminNav } from "./adminNav";
import { adminModifications } from "./adminModifications";
import { adminModificationDetail } from "./adminModificationDetail";
import { adminVehicules } from "./adminVehicules";
import { adminChauffeurs } from "./adminChauffeurs";
import { adminCatalogue } from "./adminCatalogue";
import { adminZones } from "./adminZones";
import { adminOptions } from "./adminOptions";
import { adminModesPaiement } from "./adminModesPaiement";
import { adminReglages } from "./adminReglages";

const fr = {
  common: common.fr,
  nav: nav.fr,
  home: home.fr,
  connexion: connexion.fr,
  motDePasseOublie: motDePasseOublie.fr,
  inscription: inscription.fr,
  compteEnAttente: compteEnAttente.fr,
  verifierEmail: verifierEmail.fr,
  filtresBar: filtresBar.fr,
  monProfilPage: monProfilPage.fr,
  monProfilForm: monProfilForm.fr,
  changerMotDePasse: changerMotDePasse.fr,
  profilDetail: profilDetail.fr,
  contactForm: contactForm.fr,
  profileCard: profileCard.fr,
  adminDashboard: adminDashboard.fr,
  adminNav: adminNav.fr,
  adminModifications: adminModifications.fr,
  adminModificationDetail: adminModificationDetail.fr,
  adminVehicules: adminVehicules.fr,
  adminChauffeurs: adminChauffeurs.fr,
  adminCatalogue: adminCatalogue.fr,
  adminZones: adminZones.fr,
  adminOptions: adminOptions.fr,
  adminModesPaiement: adminModesPaiement.fr,
  adminReglages: adminReglages.fr,
};

const en = {
  common: common.en,
  nav: nav.en,
  home: home.en,
  connexion: connexion.en,
  motDePasseOublie: motDePasseOublie.en,
  inscription: inscription.en,
  compteEnAttente: compteEnAttente.en,
  verifierEmail: verifierEmail.en,
  filtresBar: filtresBar.en,
  monProfilPage: monProfilPage.en,
  monProfilForm: monProfilForm.en,
  changerMotDePasse: changerMotDePasse.en,
  profilDetail: profilDetail.en,
  contactForm: contactForm.en,
  profileCard: profileCard.en,
  adminDashboard: adminDashboard.en,
  adminNav: adminNav.en,
  adminModifications: adminModifications.en,
  adminModificationDetail: adminModificationDetail.en,
  adminVehicules: adminVehicules.en,
  adminChauffeurs: adminChauffeurs.en,
  adminCatalogue: adminCatalogue.en,
  adminZones: adminZones.en,
  adminOptions: adminOptions.en,
  adminModesPaiement: adminModesPaiement.en,
  adminReglages: adminReglages.en,
} satisfies typeof fr;

const zh = {
  common: common.zh,
  nav: nav.zh,
  home: home.zh,
  connexion: connexion.zh,
  motDePasseOublie: motDePasseOublie.zh,
  inscription: inscription.zh,
  compteEnAttente: compteEnAttente.zh,
  verifierEmail: verifierEmail.zh,
  filtresBar: filtresBar.zh,
  monProfilPage: monProfilPage.zh,
  monProfilForm: monProfilForm.zh,
  changerMotDePasse: changerMotDePasse.zh,
  profilDetail: profilDetail.zh,
  contactForm: contactForm.zh,
  profileCard: profileCard.zh,
  adminDashboard: adminDashboard.zh,
  adminNav: adminNav.zh,
  adminModifications: adminModifications.zh,
  adminModificationDetail: adminModificationDetail.zh,
  adminVehicules: adminVehicules.zh,
  adminChauffeurs: adminChauffeurs.zh,
  adminCatalogue: adminCatalogue.zh,
  adminZones: adminZones.zh,
  adminOptions: adminOptions.zh,
  adminModesPaiement: adminModesPaiement.zh,
  adminReglages: adminReglages.zh,
} satisfies typeof fr;

export const dictionaries = { fr, en, zh };
export type Dictionary = typeof fr;
