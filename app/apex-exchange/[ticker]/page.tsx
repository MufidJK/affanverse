import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ApexMarketAsset } from "@/types/apex";
import AssetDetailClient from "./AssetDetailClient";

export const revalidate = 0;

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;

  const { data, error } = await supabase
    .from("apex_market_assets")
    .select("*")
    .eq("ticker", ticker.toUpperCase())
    .single();

  if (error || !data) {
    notFound();
  }

  const asset = data as ApexMarketAsset;

  return <AssetDetailClient initialAsset={asset} />;
}
