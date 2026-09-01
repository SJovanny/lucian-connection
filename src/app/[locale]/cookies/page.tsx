import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export default function CookiesPage() {
  return (
    <LegalPage title="Politique relative aux cookies et au stockage local">
      <p className="text-sm text-gray-500">Dernière mise à jour : 1er septembre 2026</p>
      <LegalSection title="Fonctionnement nécessaire">
        <p>
          Le site utilise des cookies et du stockage local nécessaires à la session utilisateur,
          à la sécurité et au fonctionnement du panier. Ils ne servent pas à suivre votre activité
          sur d’autres sites et ne nécessitent pas de consentement lorsqu’ils sont strictement
          indispensables au service demandé.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 font-semibold">Élément</th>
                <th className="px-3 py-2 font-semibold">Finalité</th>
                <th className="px-3 py-2 font-semibold">Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-3 py-2">Session Supabase</td>
                <td className="px-3 py-2">Connexion et sécurité</td>
                <td className="px-3 py-2">Session / selon expiration</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-3 py-2">`lucian-cart`</td>
                <td className="px-3 py-2">Conserver le panier</td>
                <td className="px-3 py-2">Jusqu’à 1 an</td>
              </tr>
              <tr>
                <td className="px-3 py-2">`lucian-cookie-consent`</td>
                <td className="px-3 py-2">Mémoriser vos choix</td>
                <td className="px-3 py-2">1 an</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>
      <LegalSection title="Statistiques facultatives">
        <p>
          Google Analytics pourra être utilisé ultérieurement pour comprendre la fréquentation du
          site. Ces outils seront désactivés par défaut et activés uniquement après votre accord.
          Vous pourrez refuser ou retirer votre choix à tout moment depuis le lien de gestion des
          cookies présent dans le pied de page.
        </p>
      </LegalSection>
      <LegalSection title="Vos choix">
        <p>
          La fenêtre de consentement propose d’accepter, de refuser ou de personnaliser les cookies
          facultatifs. La fermeture de la fenêtre vaut absence de consentement. Le refus ne bloque
          pas les fonctions nécessaires du site.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
