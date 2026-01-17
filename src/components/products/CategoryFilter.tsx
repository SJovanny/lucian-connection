"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { ChevronDown, ChevronUp, X, ShoppingCart } from "lucide-react";
import type { Category } from "@/types/database.types";
import { Locale } from "@/i18n/routing";
import { categoryGroups, type CategoryGroup } from "@/lib/categoryGroups";
import { CategoryIcon } from "@/components/icons/CategoryIcons";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categorySlug: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const locale = useLocale() as Locale;
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Organiser les catégories par groupe
  const categoriesByGroup = useMemo(() => {
    const grouped = new Map<string, Category[]>();
    
    categoryGroups.forEach(group => {
      const groupCategories = categories.filter(cat => 
        group.categorySlugs.includes(cat.slug)
      );
      if (groupCategories.length > 0) {
        grouped.set(group.id, groupCategories);
      }
    });
    
    return grouped;
  }, [categories]);

  // Vérifier si un groupe contient la catégorie sélectionnée
  const getActiveGroup = () => {
    for (const group of categoryGroups) {
      if (group.categorySlugs.includes(selectedCategory)) {
        return group.id;
      }
    }
    return null;
  };

  const activeGroupId = getActiveGroup();

  // Récupérer le nom de la catégorie dans la langue actuelle
  const getCategoryName = (category: Category) => {
    const translations = category.translations;
    return translations?.[locale]?.name || category.slug;
  };

  // Toggle l'expansion d'un groupe
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Vérifier si un groupe est étendu (ou contient la sélection active)
  const isGroupExpanded = (groupId: string) => {
    return expandedGroups.has(groupId) || activeGroupId === groupId;
  };

  // Compter les produits d'un groupe (approximation basée sur les catégories)
  const getGroupCategoryCount = (group: CategoryGroup) => {
    return categoriesByGroup.get(group.id)?.length || 0;
  };

  return (
    <div className="space-y-2">
      {/* Bouton "Tous" */}
      <button
        onClick={() => onCategoryChange("all")}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
          selectedCategory === "all"
            ? "bg-primary-500 text-white shadow-md"
            : "bg-white text-gray-700 border border-gray-200 hover:border-primary-200 hover:bg-primary-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">
            {locale === "fr" ? "Tous les produits" : "All products"}
          </span>
        </div>
      </button>

      {/* Groupes de catégories */}
      {categoryGroups.map(group => {
        const groupCategories = categoriesByGroup.get(group.id);
        if (!groupCategories || groupCategories.length === 0) return null;

        const isExpanded = isGroupExpanded(group.id);
        const isActive = activeGroupId === group.id;

        return (
          <div key={group.id} className="rounded-xl overflow-hidden border border-gray-200">
            {/* En-tête du groupe */}
            <button
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                isActive
                  ? "bg-primary-50 border-primary-200"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <CategoryIcon groupId={group.id} className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-900">
                    {group.translations[locale]}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({getGroupCategoryCount(group)})
                  </span>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Sous-catégories */}
            {isExpanded && (
              <div className="bg-gray-50 border-t border-gray-100">
                {groupCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.slug)}
                    className={`w-full flex items-center px-4 py-2.5 pl-12 text-left text-sm transition-all ${
                      selectedCategory === category.slug
                        ? "bg-primary-100 text-primary-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {getCategoryName(category)}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Version compacte pour mobile (pills horizontaux avec dropdown)
export function CategoryFilterMobile({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const locale = useLocale() as Locale;
  const [isOpen, setIsOpen] = useState(false);

  // Récupérer le nom de la catégorie dans la langue actuelle
  const getCategoryName = (category: Category) => {
    const translations = category.translations;
    return translations?.[locale]?.name || category.slug;
  };

  // Trouver la catégorie sélectionnée
  const selectedCategoryObj = categories.find(c => c.slug === selectedCategory);
  const selectedLabel = selectedCategory === "all" 
    ? (locale === "fr" ? "Toutes catégories" : "All categories")
    : selectedCategoryObj 
      ? getCategoryName(selectedCategoryObj)
      : "";

  // Organiser les catégories par groupe
  const categoriesByGroup = useMemo(() => {
    const grouped = new Map<string, Category[]>();
    
    categoryGroups.forEach(group => {
      const groupCategories = categories.filter(cat => 
        group.categorySlugs.includes(cat.slug)
      );
      if (groupCategories.length > 0) {
        grouped.set(group.id, groupCategories);
      }
    });
    
    return grouped;
  }, [categories]);

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary-300 transition-all"
      >
        <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
          {selectedLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Chips rapides pour les groupes principaux */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => {
            onCategoryChange("all");
            setIsOpen(false);
          }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {locale === "fr" ? "Tout" : "All"}
        </button>
        
        {categoryGroups.map(group => {
          const groupCategories = categoriesByGroup.get(group.id);
          if (!groupCategories || groupCategories.length === 0) return null;
          
          const isActive = groupCategories.some(c => c.slug === selectedCategory);
          
          return (
            <button
              key={group.id}
              onClick={() => {
                // Sélectionner la première catégorie du groupe
                if (groupCategories.length > 0) {
                  onCategoryChange(groupCategories[0].slug);
                }
                setIsOpen(false);
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isActive
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <CategoryIcon groupId={group.id} className="w-3.5 h-3.5" />
              <span>{group.translations[locale]}</span>
            </button>
          );
        })}
      </div>

      {/* Dropdown complet */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[60vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {locale === "fr" ? "Catégories" : "Categories"}
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Option "Tous" */}
            <button
              onClick={() => {
                onCategoryChange("all");
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                selectedCategory === "all"
                  ? "bg-primary-50 text-primary-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">
                {locale === "fr" ? "Tous les produits" : "All products"}
              </span>
            </button>

            {/* Groupes */}
            {categoryGroups.map(group => {
              const groupCategories = categoriesByGroup.get(group.id);
              if (!groupCategories || groupCategories.length === 0) return null;

              return (
                <div key={group.id} className="border-t border-gray-100">
                  {/* Titre du groupe */}
                  <div className="px-4 py-2 bg-gray-50">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <CategoryIcon groupId={group.id} className="w-4 h-4" />
                      {group.translations[locale]}
                    </span>
                  </div>
                  
                  {/* Catégories du groupe */}
                  {groupCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        onCategoryChange(category.slug);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-2.5 pl-10 text-left text-sm ${
                        selectedCategory === category.slug
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {getCategoryName(category)}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
