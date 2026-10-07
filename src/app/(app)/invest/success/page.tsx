"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SuccessState } from "@/components/invest/SuccessState";
import { PageSkeleton } from "@/components/ui/states";
import { useAppStore } from "@/hooks/useAppStore";

export default function InvestSuccessPage() {
  const { state } = useAppStore();
  const router = useRouter();
  const last = state.lastInvestment;
  const tx = state.transactions.find((t) => t.id === last?.transactionId);

  useEffect(() => {
    if (!tx) router.replace("/portfolio");
  }, [tx, router]);

  if (!last || !tx) return <PageSkeleton />;
  return <SuccessState tx={tx} last={last} />;
}
