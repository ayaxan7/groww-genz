import { Suspense } from "react";
import { InstrumentDetail } from "@/components/explore/InstrumentDetail";
import { PageSkeleton } from "@/components/ui/states";
import { instruments } from "@/data/instruments";

export function generateStaticParams() {
  return instruments.map((i) => ({ id: i.id }));
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InstrumentDetail id={id} />;
}

export default function InstrumentPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
