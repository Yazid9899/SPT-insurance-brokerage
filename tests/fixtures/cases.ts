export const sampleCargoCasePayload = {
  productLine: "CARGO",
  cargoProduct: "CPO",
  coverType: "SINGLE_SHIPMENT",
  transportMode: "MARINE",
  clientName: "PT Sawit Nusantara",
  clientCompany: "PT Sawit Nusantara",
  clientEmail: "ops@ptsawit.test",
  currency: "IDR",
  sumInsured: 15000000000,
  clientRate: 0.2,
  insurerRate: 0.15,
  origin: "Dumai",
  destination: "Jakarta",
  vessel: "MV Test",
  quantity: 1000,
  notes: "Fixture",
};

export const sampleNonCargoCasePayload = {
  productLine: "PROPERTY",
  clientName: "PT Utility Test",
  currency: "IDR",
  sumInsured: 100000000,
  clientRate: 0.3,
  insurerRate: 0.2,
  notes: "Non-cargo fixture",
};
