import { LocationView } from "@/components/views/location-view";

export default async function LieuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LocationView slug={slug} />;
}
