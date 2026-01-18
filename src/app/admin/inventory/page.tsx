import { getAllProductsForInventory } from "@/lib/supabase/queries";
import InventoryManager from "@/components/admin/InventoryManager";

export default async function InventoryPage() {
  const products = await getAllProductsForInventory();

  return <InventoryManager initialProducts={products} locale="fr" />;
}
