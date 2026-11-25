import BannerForm from "@/components/Admin/BannerForm";
export default async function EditBannerPage({params}:{params:Promise<{id:string}>}) {
  return <BannerForm bannerId={(await params).id}/>;
}
