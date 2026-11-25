import ProductForm from "@/components/Admin/ProductForm";

export default async function EditProductPage({params}: {params:Promise<{id:string}>}) {
  return <ProductForm id={(await params).id}/>;
}
