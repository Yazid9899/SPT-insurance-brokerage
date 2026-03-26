import { calculatePremiums } from "@/lib/calculations";

export type ShipmentCandidateRowInput = {
  rowIndex: number;
  origin: string | null;
  destination: string | null;
  vessel: string | null;
  quantity: number | null;
  sumInsured: number | null;
  etd: string | null;
  eta?: string | null;
  notes?: string | null;
};

export type ShipmentCandidateRow = ShipmentCandidateRowInput & {
  clientPremium: string;
  insurerPremium: string;
  brokerCommission: string;
  errors: string[];
};

export function validateBatchSize(rows: ShipmentCandidateRowInput[]) {
  if (rows.length < 1 || rows.length > 10) {
    return "Batch must contain between 1 and 10 rows";
  }
  return null;
}

export function validateShipmentRow(
  row: ShipmentCandidateRowInput,
  rates: { clientRate: number; insurerRate: number },
): ShipmentCandidateRow {
  const errors: string[] = [];

  if (!row.origin) errors.push("Origin is required");
  if (!row.destination) errors.push("Destination is required");
  if (!row.vessel) errors.push("Vessel/Fleet is required");
  if (!row.etd) errors.push("ETD is required");
  if (row.quantity == null || row.quantity <= 0) errors.push("Quantity must be > 0");
  if (row.sumInsured == null || row.sumInsured <= 0) errors.push("Sum Insured must be > 0");
  if (rates.clientRate <= 0) errors.push("Client rate must be > 0");
  if (rates.insurerRate <= 0) errors.push("Insurer rate must be > 0");
  if (rates.clientRate < rates.insurerRate) errors.push("Client rate must be greater than or equal to insurer rate");

  const premiums =
    row.sumInsured && row.sumInsured > 0
      ? calculatePremiums({
          sumInsured: row.sumInsured,
          clientRate: rates.clientRate,
          insurerRate: rates.insurerRate,
        })
      : { clientPremium: "0.00", insurerPremium: "0.00", brokerCommission: "0.00" };

  return {
    ...row,
    clientPremium: premiums.clientPremium,
    insurerPremium: premiums.insurerPremium,
    brokerCommission: premiums.brokerCommission,
    errors,
  };
}

