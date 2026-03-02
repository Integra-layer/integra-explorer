"use client";

import { use } from "react";
import { PageTransition } from "@/components/effects";
import { ValidatorDetail } from "@/components/validators/validator-detail";
import { useValidator, useValidatorDelegations } from "@/lib/hooks/use-validators";

interface ValidatorPageProps {
  params: Promise<{ address: string }>;
}

export default function ValidatorPage({ params }: ValidatorPageProps) {
  const { address } = use(params);
  const { data: validator, isLoading: loadingValidator } = useValidator(address);
  const { data: delegations, isLoading: loadingDelegations } =
    useValidatorDelegations(address);

  return (
    <PageTransition>
      <section className="container mx-auto px-4 py-8">
        <ValidatorDetail
          validator={validator}
          delegations={delegations}
          isLoading={loadingValidator || loadingDelegations}
        />
      </section>
    </PageTransition>
  );
}
