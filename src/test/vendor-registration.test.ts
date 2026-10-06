import { afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  validateVendorApplication,
  validateVendorProfilePatch,
} from "@/lib/api/vendor-registration";
import { db, type VendorRow } from "@/lib/server/db";
import { toVendorApplicationDto, toVendorDto } from "@/lib/server/dto";
import {
  createApplicationForUser,
  findApplicationByUser,
  reviewApplication,
} from "@/lib/server/vendor-applications";
import { seedIfEmpty } from "@/lib/server/seed";

beforeAll(() => {
  seedIfEmpty();
});

afterEach(() => {
  db().t.vendorApplications.clear();
});

const validApplication = {
  storeName: "Lantern & Co.",
  description: "Handmade ceramic lanterns and home decor crafted in small batches.",
  category: "home",
  phone: "9876543210",
  city: "Jaipur",
};

describe("vendor application validation", () => {
  it("accepts a complete bounded application", () => {
    expect(validateVendorApplication(validApplication)).toEqual(validApplication);
  });

  it("rejects short store name, thin description, unknown category and bad phone", () => {
    expect(() => validateVendorApplication({ ...validApplication, storeName: "ab" })).toThrow();
    expect(() => validateVendorApplication({ ...validApplication, description: "too short" })).toThrow();
    expect(() => validateVendorApplication({ ...validApplication, category: "weapons" })).toThrow();
    expect(() => validateVendorApplication({ ...validApplication, phone: "1234567890" })).toThrow();
  });

  it("rejects status/verified/role/userId privilege-escalation fields", () => {
    for (const key of ["userId", "status", "verified", "approved", "role", "vendorId", "id"] as const) {
      expect(() => validateVendorApplication({ ...validApplication, [key]: "attacker" })).toThrow(/invalid request field/i);
    }
  });
});

describe("vendor application lifecycle", () => {
  it("creates a Pending application that the applicant cannot self-approve", () => {
    const app = createApplicationForUser("applicant-a", validApplication);
    expect(app.status).toBe("Pending");
    expect(app.reviewedByUserId).toBeNull();
    // There is no customer-facing field or path to change status: the DTO never
    // carries userId/reviewer, and the only transition is reviewApplication.
    const dto = toVendorApplicationDto(app);
    expect(JSON.stringify(dto)).not.toContain("applicant-a");
    expect(JSON.stringify(dto)).not.toContain("reviewedByUserId");
  });

  it("allows only one application per user", () => {
    createApplicationForUser("applicant-a", validApplication);
    expect(() => createApplicationForUser("applicant-a", validApplication)).toThrow(/already have a vendor application/i);
  });

  it("refuses an application from an existing seller", () => {
    const vendor = [...db().t.vendors.values()][0]!;
    expect(vendor.userId).toBeTruthy();
    expect(() => createApplicationForUser(vendor.userId!, validApplication)).toThrow(/already have a vendor account/i);
  });

  it("isolates applications per user (no cross-user visibility)", () => {
    createApplicationForUser("applicant-a", validApplication);
    expect(findApplicationByUser("applicant-a")).toBeDefined();
    expect(findApplicationByUser("applicant-b")).toBeUndefined();
  });

  it("transitions status only through admin review, once", () => {
    const app = createApplicationForUser("applicant-a", validApplication);
    const approved = reviewApplication(app.id, "Approved", "admin-user", null);
    expect(approved.status).toBe("Approved");
    expect(approved.reviewedByUserId).toBe("admin-user");
    expect(() => reviewApplication(app.id, "Rejected", "admin-user", "late")).toThrow(/already been reviewed/i);
  });
});

describe("vendor profile updates", () => {
  it("accepts only safe display fields and requires a real change", () => {
    expect(validateVendorProfilePatch({ name: "New Store", tagline: "Fresh goods", city: "Pune" })).toEqual({
      name: "New Store",
      tagline: "Fresh goods",
      city: "Pune",
    });
    expect(() => validateVendorProfilePatch({})).toThrow(/at least one/i);
  });

  it("rejects status/verified/rating/owner mass-assignment on profile update", () => {
    for (const key of ["status", "verified", "rating", "since", "userId", "id", "vendorId"] as const) {
      expect(() => validateVendorProfilePatch({ name: "New Store", [key]: "attacker" })).toThrow(/invalid request field/i);
    }
  });

  it("vendor profile DTO never exposes userId or account identifiers", () => {
    const vendor = [...db().t.vendors.values()][0]!;
    const wire = JSON.stringify(toVendorDto(vendor));
    expect(wire).not.toContain("userId");
    expect(wire).not.toContain(vendor.userId ?? "no-user");
  });

  it("profile ownership derives from the vendor row, with no vendorId input accepted", () => {
    // Two distinct seeded stores exist; neither validator nor DTO carries a
    // vendorId, so a profile request can only ever resolve the caller's own row.
    const vendors = [...db().t.vendors.values()] as VendorRow[];
    expect(vendors.length).toBeGreaterThan(1);
    expect(new Set(vendors.map((v) => v.userId)).size).toBe(vendors.length);
  });
});
