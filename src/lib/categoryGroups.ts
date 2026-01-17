// Configuration des groupes de catégories pour l'affichage
// Permet de regrouper les catégories par thème pour une meilleure navigation

export interface CategoryGroup {
  id: string;
  icon: string;
  image: string;
  translations: {
    fr: string;
    en: string;
  };
  categorySlugs: string[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    id: "alimentation",
    icon: "🍽️",
    image: "/images/categories/food.png",
    translations: {
      fr: "Alimentation",
      en: "Food",
    },
    categorySlugs: [
      "assaisonnement",
      "epicerie-sucree",
      "epicerie-salee",
      "conserves-condiments",
    ],
  },
  {
    id: "beaute-soins",
    icon: "💄",
    image: "/images/categories/products.png",
    translations: {
      fr: "Beauté & Soins",
      en: "Beauty & Care",
    },
    categorySlugs: [
      "soins-capillaires",
      "hygiene-beaute",
      "parfums",
    ],
  },
  {
    id: "famille",
    icon: "👨‍👩‍👧‍👦",
    image: "/images/categories/family.png",
    translations: {
      fr: "Famille",
      en: "Family",
    },
    categorySlugs: [
      "bebe-enfant",
      "sante-bien-etre",
    ],
  },
  {
    id: "maison",
    icon: "🏠",
    image: "/images/categories/house.png",
    translations: {
      fr: "Maison",
      en: "Home",
    },
    categorySlugs: [
      "entretien-menager",
    ],
  },
  {
    id: "boissons",
    icon: "🥤",
    image: "/images/categories/soft-drink.png",
    translations: {
      fr: "Boissons",
      en: "Beverages",
    },
    categorySlugs: [
      "boissons-sans-alcool",
      "boissons-alcoolisees",
      "seamoss",
    ],
  },
];

// Helper pour trouver le groupe d'une catégorie
export function findCategoryGroup(categorySlug: string): CategoryGroup | undefined {
  return categoryGroups.find(group => 
    group.categorySlugs.includes(categorySlug)
  );
}

// Helper pour obtenir toutes les catégories d'un groupe
export function getCategoriesInGroup(groupId: string): string[] {
  const group = categoryGroups.find(g => g.id === groupId);
  return group?.categorySlugs || [];
}
