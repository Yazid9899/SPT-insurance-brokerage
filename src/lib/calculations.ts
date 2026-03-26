import Decimal from "decimal.js";

export type PremiumCalculationInput = {
  sumInsured: Decimal.Value;
  clientRate: Decimal.Value;
  insurerRate: Decimal.Value;
};

export type PremiumCalculationResult = {
  clientPremium: string;
  insurerPremium: string;
  brokerCommission: string;
};

export function calculatePremiums(input: PremiumCalculationInput): PremiumCalculationResult {
  const sumInsured = new Decimal(input.sumInsured);
  const clientRate = new Decimal(input.clientRate);
  const insurerRate = new Decimal(input.insurerRate);

  const hundred = new Decimal(100);
  const clientPremium = sumInsured.mul(clientRate).div(hundred);
  const insurerPremium = sumInsured.mul(insurerRate).div(hundred);
  const brokerCommission = clientPremium.minus(insurerPremium);

  return {
    clientPremium: clientPremium.toFixed(2),
    insurerPremium: insurerPremium.toFixed(2),
    brokerCommission: brokerCommission.toFixed(2),
  };
}
