"use client";

import { use } from "react";
import { PageTransition } from "@/components/effects";
import { ValidatorDetail } from "@/components/validators/validator-detail";
import {
  useValidator,
  useValidatorDelegations,
} from "@/lib/hooks/use-validators";

interface ValidatorPageClientProps {
  params: Promise<{ address: string }>;
}

export default function ValidatorPageClient({
  params,
}: ValidatorPageClientProps) {
  const { address } = use(params);
  const {
    data: validator,
    isLoading: loadingValidator,
    error: validatorError,
  } = useValidator(address);
  const {
    data: delegations,
    isLoading: loadingDelegations,
    error: delegationsError,
  } = useValidatorDelegations(address);

  const error = validatorError || delegationsError;

  if (error) {
    return (
      <PageTransition>
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <h1 className="text-2xl font-bold">Validator Not Found</h1>
            <p className="text-muted-foreground">
              Validator {address} could not be loaded. It may not exist or the
              API may be temporarily unavailable. Please try again later.
            </p>
          </div>
        </section>
      </PageTransition>
    );
  }

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
