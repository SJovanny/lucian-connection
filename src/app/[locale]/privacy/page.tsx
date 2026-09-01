import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <p className="text-sm text-gray-500">Dernière mise à jour : 1er septembre 2026</p>
      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement est Ginny SIMON, entrepreneur individuel, joignable à
          contact@lucianconnection.com ou au +596 696 94 96 52.
        </p>
      </LegalSection>
      <LegalSection title="Données collectées et finalités">
        <p>
          Nous pouvons traiter le nom, l’adresse email, le téléphone, les informations de compte,
          les commandes, les créneaux de retrait, les notes de commande et les échanges avec le
          service client pour créer le compte, traiter la commande, gérer le paiement, organiser
          le retrait, assurer le support et respecter nos obligations légales.
        </p>
      </LegalSection>
      <LegalSection title="Bases légales">
        <p>
          Les traitements nécessaires à la commande reposent sur l’exécution du contrat ou de
          mesures précontractuelles. Les obligations comptables et légales reposent sur une
          obligation légale. Les statistiques et communications facultatives reposent sur le
          consentement lorsqu’il est requis.
        </p>
      </LegalSection>
      <LegalSection title="Destinataires et prestataires">
        <p>
          Les données sont accessibles uniquement aux personnes habilitées et aux prestataires
          nécessaires au fonctionnement du service, notamment l’hébergement, Supabase et Stripe.
          Stripe traite les données de paiement selon ses propres conditions et sa politique de
          confidentialité.
        </p>
      </LegalSection>
      <LegalSection title="Durées de conservation">
        <p>
          Les données du compte sont conservées pendant sa durée d’utilisation puis supprimées ou
          anonymisées selon les obligations applicables. Les données de commande et de facturation
          sont conservées pendant la durée légale nécessaire. Les consentements sont conservés
          pour démontrer le choix exprimé.
        </p>
      </LegalSection>
      <LegalSection title="Vos droits">
        <p>
          Vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la
          portabilité de vos données, ou vous opposer à certains traitements, en écrivant à
          contact@lucianconnection.com. Vous pouvez également introduire une réclamation auprès
          de la CNIL.
        </p>
      </LegalSection>
      <LegalSection title="Sécurité">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles adaptées. Les
          identifiants et données de paiement ne doivent jamais être communiqués par email ou dans
          les notes de commande.
        </p>
      </LegalSection>
      <LegalSection title="Évolution de la politique">
        <p>
          Cette politique peut évoluer pour refléter les changements du site, des prestataires ou
          de la réglementation. La date de mise à jour est indiquée en haut de la page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
