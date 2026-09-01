import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export default function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales">
      <LegalSection title="Éditeur du site">
        <p>
          Le site Lucian Connection est édité par Ginny SIMON, entrepreneur individuel,
          exerçant sous l’enseigne G &amp; G&apos;S ISLANDWIDE DISTRIBUTION et l’enseigne
          commerciale LUCIAN CONNECTION.
        </p>
        <p>
          Adresse : 119 rue Lamartine, 97200 Fort-de-France, Martinique.<br />
          SIREN : 483 748 042<br />
          SIRET de l’établissement : 483 748 042 00049<br />
          Email : contact@lucianconnection.com<br />
          Téléphone : +596 696 94 96 52
        </p>
      </LegalSection>
      <LegalSection title="Directeur de la publication">
        <p>Ginny SIMON.</p>
      </LegalSection>
      <LegalSection title="Hébergement">
        <p>
          Le site est destiné à être hébergé par OVHcloud. Les coordonnées exactes de
          l’hébergeur seront complétées dès la souscription de l’offre et du nom de domaine.
        </p>
      </LegalSection>
      <LegalSection title="Propriété intellectuelle">
        <p>
          Les textes, marques, visuels, logos et éléments graphiques du site sont protégés.
          Toute reproduction ou réutilisation non autorisée est interdite.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
