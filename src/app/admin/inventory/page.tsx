import ProductInventoryTable from "@/components/Admin/ProductInventoryTable";

export default function InventoryPage() {
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold text-dark">Inventory</h1>
      <ProductInventoryTable />
    </section>
  );
}
