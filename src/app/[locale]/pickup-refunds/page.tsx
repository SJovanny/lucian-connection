import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export default function PickupRefundsPage() {
  return (
    <LegalPage title="Politique de retrait et de remboursement">
      <p className="text-sm text-gray-500">Version applicable : 1.0 — 5 septembre 2026</p>
      <LegalSection title="Retrait en magasin">
        <p>
          Lucian Connection fonctionne en Click &amp; Collect. Après confirmation du paiement,
          la commande est préparée pour le créneau choisi et retirée au point de vente indiqué
          lors de la commande, à Fort-de-France.
        </p>
        <p>
          Le client présente le numéro de commande ou le message de confirmation ainsi qu’une
          pièce permettant de vérifier son identité si nécessaire. Une personne mandatée doit
          pouvoir justifier de son identité et présenter les informations de la commande.
        </p>
      </LegalSection>
      <LegalSection title="Commande non retirée">
        <p>
          En cas de retard ou d’empêchement, le client doit contacter rapidement
          contact@lucianconnection.com ou le +596 696 94 96 52. Une nouvelle organisation du
          retrait pourra être proposée selon la nature des produits et leur conservation.
        </p>
        <p>
          Les produits frais, réfrigérés ou périssables ne peuvent pas être conservés au-delà de
          leur durée de conservation. Une commande non retirée ne donne donc pas automatiquement
          droit à un remboursement lorsque la conservation ou la sécurité des produits n’est plus
          garantie.
        </p>
      </LegalSection>
      <LegalSection title="Annulation et remboursement">
        <p>
          Avant la préparation de la commande, le client peut demander son annulation par écrit.
          Lorsque l’annulation est acceptée, le remboursement est effectué sur le moyen de
          paiement utilisé, dans les délais dépendant de Stripe et de l’établissement bancaire.
        </p>
        <p>
          Si un produit est indisponible ou non conforme, Lucian Connection peut proposer son
          remplacement avec l’accord du client ou rembourser la partie concernée. Les frais de
          préparation sont remboursés lorsqu’ils correspondent à une commande entièrement annulée
          du fait du vendeur.
        </p>
        <p>
          Les remboursements partiels sont calculés sur les produits concernés et peuvent tenir
          compte d’une réduction appliquée à la commande. Le client est informé de la solution
          retenue avant son traitement.
        </p>
      </LegalSection>
      <LegalSection title="Rétractation et garanties">
        <p>
          Le droit de rétractation ne s’applique pas aux produits susceptibles de se détériorer ou
          de se périmer rapidement, ni aux autres exceptions prévues par la loi. Cette exclusion
          ne limite pas les garanties légales de conformité et contre les vices cachés.
        </p>
        <p>
          Toute réclamation doit être adressée à contact@lucianconnection.com avec le numéro de
          commande, les produits concernés et, si utile, des photographies.
        </p>
      </LegalSection>
      <LegalSection title="Produits alcoolisés">
        <p>
          Pour toute commande contenant de l’alcool, le client doit confirmer être âgé d’au moins
          18 ans. Lors du retrait, une pièce d’identité peut être demandée. En l’absence de preuve
          d’âge suffisante, la remise des produits alcoolisés est refusée et la commande est
          traitée selon les règles d’annulation et de remboursement applicables.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
