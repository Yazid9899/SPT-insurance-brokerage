import { hash } from "bcryptjs";
import { PrismaClient, ProductLine, Currency, CaseStatus, CargoProduct } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("ChangeMe123!", 10);

  const user = await prisma.user.upsert({
    where: { email: "casemaker@cargoshield.local" },
    update: { name: "Case Maker", passwordHash },
    create: {
      email: "casemaker@cargoshield.local",
      name: "Case Maker",
      passwordHash,
    },
  });

  await prisma.openCover.upsert({
    where: { reference: "OC-FOUNDATION-001" },
    update: {},
    create: {
      reference: "OC-FOUNDATION-001",
      clientName: "Foundation Client",
      clientCompany: "Foundation Co",
      insurerName: "Foundation Insurer",
      cargoProduct: CargoProduct.CPO,
      insurerRate: "0.150000",
      currency: Currency.USD,
      effectiveFrom: new Date("2026-01-01"),
      effectiveTo: new Date("2026-12-31"),
    },
  });

  await prisma.case.upsert({
    where: { caseNumber: "BRK-2026-0001" },
    update: {},
    create: {
      caseNumber: "BRK-2026-0001",
      productLine: ProductLine.CARGO,
      cargoProduct: CargoProduct.CPO,
      clientName: "Foundation Client",
      status: CaseStatus.DRAFT,
      currency: Currency.USD,
      sumInsured: "100000.00",
      clientRate: "0.250000",
      insurerRate: "0.150000",
      clientPremium: "250.00",
      insurerPremium: "150.00",
      brokerCommission: "100.00",
      createdById: user.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
