import { NAV_ITEMS } from "@/lib/constants";

export type NavItem = (typeof NAV_ITEMS)[number];

export type FoundationBootstrapResponse = {
  appName: string;
  user: {
    name: string | null | undefined;
    email: string | null | undefined;
  };
  navigation: NavItem[];
  defaultRoute: string;
};

export type FoundationReferencesResponse = {
  productLines: string[];
  cargoSubProducts: string[];
  caseLifecycle: string[];
};
