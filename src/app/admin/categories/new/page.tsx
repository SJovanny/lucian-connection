import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Nouvelle catégorie
        </h1>
        <p className="text-gray-500 mt-1">
          Ajoutez une nouvelle catégorie de produits
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
