import { isAfter, isBefore, isEqual } from "date-fns";

import type { OpenCoverStatus } from "@/lib/constants";

export function getOpenCoverStatus(effectiveFrom: Date, effectiveTo: Date, now = new Date()): OpenCoverStatus {
  const startsLater = isAfter(effectiveFrom, now) && !isEqual(effectiveFrom, now);
  const endedEarlier = isBefore(effectiveTo, now) && !isEqual(effectiveTo, now);

  if (startsLater || endedEarlier) {
    return "EXPIRED";
  }

  return "ACTIVE";
}

export function isOpenCoverActive(effectiveFrom: Date, effectiveTo: Date, now = new Date()): boolean {
  return getOpenCoverStatus(effectiveFrom, effectiveTo, now) === "ACTIVE";
}
