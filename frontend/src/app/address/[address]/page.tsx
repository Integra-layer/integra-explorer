"use client";

import { use } from "react";
import { FileCode, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTransition, CopyButton } from "@/components/effects";
import { useAddress } from "@/lib/hooks/use-address";
import { truncateAddress } from "@/lib/format";
import { BalanceCard } from "@/components/address/balance-card";
import { ActivityFeed } from "@/components/address/activity-feed";
import { TokenHoldings } from "@/components/address/token-holdings";
import { ContractTab } from "@/components/address/contract-tab";

interface AddressPageProps {
  params: Promise<{ address: string }>;
}

export default function AddressPage({ params }: AddressPageProps) {
  const { address } = use(params);
  const { data: addressData, isLoading } = useAddress(address);

  const isContract = !!addressData?.contract;
  const hasTokens =
    addressData?.tokenBalances && addressData.tokenBalances.length > 0;

  return (
    <PageTransition>
      <section className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* ---------------------------------------------------------------- */}
          {/* Header */}
          {/* ---------------------------------------------------------------- */}
          <div className="flex flex-wrap items-center gap-3">
            {isContract ? (
              <FileCode className="size-6 text-integra-brand" />
            ) : (
              <User className="size-6 text-integra-brand" />
            )}

            <h1 className="text-2xl font-bold tracking-tight">
              <span className="hidden md:inline">{address}</span>
              <span className="md:hidden">{truncateAddress(address, 8)}</span>
            </h1>

            <CopyButton text={address} />

            {isContract && (
              <Badge className="gap-1.5 bg-integra-brand/10 text-integra-brand hover:bg-integra-brand/20">
                <FileCode className="size-3" />
                Contract
              </Badge>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Main layout: Balance card + Tabs */}
          {/* ---------------------------------------------------------------- */}
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Balance card */}
            <div>
              <BalanceCard
                balance={addressData?.balance ?? "0"}
                address={address}
                isContract={isContract}
                isLoading={isLoading}
              />
            </div>

            {/* Tabs section */}
            <div>
              <Tabs defaultValue="activity">
                <TabsList>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  {(hasTokens || isLoading) && (
                    <TabsTrigger value="tokens">Tokens</TabsTrigger>
                  )}
                  {(isContract || isLoading) && (
                    <TabsTrigger value="contract">Contract</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="activity" className="mt-4">
                  <ActivityFeed address={address} />
                </TabsContent>

                {(hasTokens || isLoading) && (
                  <TabsContent value="tokens" className="mt-4">
                    <TokenHoldings
                      tokenBalances={addressData?.tokenBalances}
                      isLoading={isLoading}
                    />
                  </TabsContent>
                )}

                {(isContract || isLoading) && (
                  <TabsContent value="contract" className="mt-4">
                    <ContractTab
                      contract={addressData?.contract ?? undefined}
                      isLoading={isLoading}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
