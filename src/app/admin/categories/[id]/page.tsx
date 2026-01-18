import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getCategoryById } from "@/lib/supabase/queries";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Modifier la catégorie
        </h1>
        <p className="text-gray-500 mt-1">
          Modifiez les informations de {category.translations.fr.name}
        </p>
      </div>

      <CategoryForm category={category} isEditing />
    </div>
  );
}
