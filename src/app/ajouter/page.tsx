import { AddView } from "@/components/views/add-view";

export default async function AjouterPage({
  searchParams,
}: {
  searchParams: Promise<{ lieu?: string }>;
}) {
  const { lieu } = await searchParams;
  return <AddView initialSlug={lieu} />;
}
