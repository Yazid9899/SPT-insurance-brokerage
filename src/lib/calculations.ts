import Decimal from "decimal.js";
import type { Currency } from "@prisma/client";

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

const USD_CONVERSION_RATES: Record<Currency, Decimal> = {
  USD: new Decimal(1),
  IDR: new Decimal(16000),
  SGD: new Decimal(1.35),
  MYR: new Decimal(4.7),
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

export function convertToUsdExposure(input: { amount: Decimal.Value; currency: Currency }) {
  const rate = USD_CONVERSION_RATES[input.currency];
  if (!rate) {
    return null;
  }
  const amount = new Decimal(input.amount);
  return amount.div(rate);
}
