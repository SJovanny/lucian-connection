import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage title="Conditions générales de vente et d’utilisation">
      <p className="text-sm text-gray-500">Version applicable : 1.0 — 1er septembre 2026</p>
      <LegalSection title="1. Vendeur et objet">
        <p>
          Les présentes conditions régissent l’utilisation du site Lucian Connection et la
          vente en ligne de produits proposés par Ginny SIMON, entrepreneur individuel,
          exploitant l’enseigne G &amp; G&apos;S ISLANDWIDE DISTRIBUTION / LUCIAN CONNECTION,
          119 rue Lamartine, 97200 Fort-de-France, Martinique, SIREN 483 748 042.
        </p>
      </LegalSection>
      <LegalSection title="2. Produits et prix">
        <p>
          Les produits, leurs caractéristiques, leur disponibilité et leur prix sont affichés
          avant la commande. Les prix sont indiqués en euros, TVA comprise lorsque celle-ci est
          applicable. Une erreur manifeste d’affichage pourra être corrigée avant confirmation.
        </p>
      </LegalSection>
      <LegalSection title="3. Compte et commande">
        <p>
          La création d’un compte permet de sécuriser la commande et de retrouver son historique.
          Le client garantit l’exactitude des informations communiquées. La commande devient
          définitive après validation du récapitulatif, acceptation des présentes CGV et
          confirmation du paiement par le prestataire de paiement.
        </p>
      </LegalSection>
      <LegalSection title="4. Paiement">
        <p>
          Le paiement est réalisé en ligne par l’intermédiaire de Stripe. Les données de carte
          sont traitées par Stripe et ne sont pas stockées par Lucian Connection. Le débit et la
          confirmation du paiement peuvent être soumis aux contrôles d’authentification forte
          prévus par la réglementation bancaire.
        </p>
      </LegalSection>
      <LegalSection title="5. Retrait en magasin">
        <p>
          Les commandes sont retirées à l’adresse indiquée lors de la commande, à Fort-de-France,
          pendant le créneau sélectionné. Le client doit présenter les informations nécessaires
          à l’identification de la commande. Les commandes non retirées doivent faire l’objet
          d’une prise de contact avec le vendeur afin de convenir d’une solution.
        </p>
      </LegalSection>
      <LegalSection title="6. Indisponibilité, annulation et remboursement">
        <p>
          Si un produit devient indisponible, le vendeur informe le client et peut proposer son
          remplacement, une réduction ou le remboursement de la partie concernée. Les
          remboursements sont effectués via le moyen de paiement utilisé, sauf accord contraire.
        </p>
      </LegalSection>
      <LegalSection title="7. Rétractation et produits alimentaires">
        <p>
          Le droit de rétractation peut être exclu pour les produits susceptibles de se détériorer
          ou de se périmer rapidement, ainsi que dans les autres cas prévus par la loi. Les
          modalités applicables sont précisées avant la commande. Les garanties légales restent
          applicables aux produits concernés.
        </p>
      </LegalSection>
      <LegalSection title="8. Réclamations et médiation">
        <p>
          Toute réclamation peut être adressée à contact@lucianconnection.com. Après réclamation
          écrite préalable et en l’absence de solution, le consommateur peut recourir gratuitement
          au médiateur de la consommation dont les coordonnées seront indiquées dès son désignation.
        </p>
      </LegalSection>
      <LegalSection title="9. Acceptation">
        <p>
          Le client reconnaît avoir pris connaissance des présentes CGV et les accepter avant
          toute commande. La version acceptée est conservée avec les informations de commande.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
