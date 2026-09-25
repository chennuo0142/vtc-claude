type VCardContact = {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
};

// RFC 2426 : échappement des caractères spéciaux dans les valeurs texte.
function escapeValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,");
}

export function buildVCard({ nom, prenom, telephone, email }: VCardContact): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeValue(nom)};${escapeValue(prenom)};;;`,
    `FN:${escapeValue(`${prenom} ${nom}`)}`,
    `TEL;TYPE=CELL:${escapeValue(telephone)}`,
  ];
  if (email) lines.push(`EMAIL;TYPE=INTERNET:${escapeValue(email)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n") + "\r\n";
}

export function vcardFilename(prenom: string, nom: string): string {
  const slug = `${prenom}-${nom}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${slug || "contact"}.vcf`;
}
