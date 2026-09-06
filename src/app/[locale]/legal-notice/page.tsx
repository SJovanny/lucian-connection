import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { getLegalHost, getLegalMediator } from "@/lib/legal";

export default function LegalNoticePage() {
  const host = getLegalHost();
  const mediator = getLegalMediator();

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
          Email : contact@lucianconnection.fr<br />
          Téléphone : +596 696 94 96 52
        </p>
      </LegalSection>
      <LegalSection title="Directeur de la publication">
        <p>Ginny SIMON.</p>
      </LegalSection>
      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par {host.name}.<br />
          Adresse : {host.address}<br />
          Téléphone : {host.phone}<br />
          Site : <a href={host.website} className="text-primary-700 underline">{host.website}</a>
        </p>
      </LegalSection>
      <LegalSection title="Médiation de la consommation">
        {mediator ? (
          <p>
            Après une réclamation écrite préalable adressée à contact@lucianconnection.fr,
            le consommateur peut saisir gratuitement le médiateur suivant : {mediator.name}.<br />
            Adresse : {mediator.address}<br />
            {mediator.phone && <>Téléphone : {mediator.phone}<br /></>}
            Site : <a href={mediator.website} className="text-primary-700 underline">{mediator.website}</a>
          </p>
        ) : (
          <p>
            Le médiateur de la consommation compétent et ses coordonnées doivent être renseignés
            avant la mise en ligne du service. En attendant, toute réclamation peut être adressée
            à contact@lucianconnection.fr.
          </p>
        )}
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
