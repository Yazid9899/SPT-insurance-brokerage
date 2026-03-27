type PartyRef = {
  id: string;
  displayName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE";
} | null;

type CasePartyProjectionInput = {
  client: PartyRef;
  insurer: PartyRef;
  clientName: string;
  clientCompany: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  insurerName?: string | null;
};

export type CasePartyProjection = {
  clientId: string | null;
  insurerId: string | null;
  clientName: string;
  clientCompany: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  insurerName: string | null;
  source: "normalized" | "snapshot";
};

export function projectCaseParty(input: CasePartyProjectionInput): CasePartyProjection {
  const hasNormalized = Boolean(input.client || input.insurer);

  return {
    clientId: input.client?.id ?? null,
    insurerId: input.insurer?.id ?? null,
    clientName: input.client?.displayName ?? input.clientName,
    clientCompany: input.client?.company ?? input.clientCompany,
    clientEmail: input.client?.email ?? input.clientEmail,
    clientPhone: input.client?.phone ?? input.clientPhone,
    insurerName: input.insurer?.displayName ?? input.insurerName ?? null,
    source: hasNormalized ? "normalized" : "snapshot",
  };
}

