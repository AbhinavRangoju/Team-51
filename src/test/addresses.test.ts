import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { validateAddressId, validateCreateAddress, validateUpdateAddress } from "@/lib/api/addresses";
import {
  createAddressForUser,
  deleteAddressForUser,
  listAddressRows,
  setDefaultAddressForUser,
  updateAddressForUser,
} from "@/lib/server/addresses";
import { db } from "@/lib/server/db";
import { toAddressDto } from "@/lib/server/dto";
import { requireOwnAddress } from "@/lib/server/guards";
import { seedIfEmpty } from "@/lib/server/seed";

beforeAll(() => {
  seedIfEmpty();
});

afterEach(() => {
  db().t.addresses.clear();
});

const validAddress = {
  label: "Home",
  name: "Priya Sharma",
  phone: "9876543210",
  line1: "12 Lake View Road",
  line2: "Near Central Park",
  city: "Bengaluru",
  state: "Karnataka",
  postalCode: "560034",
  country: "IN" as const,
};

describe("address validation", () => {
  it("accepts a complete bounded Indian postal address", () => {
    expect(validateCreateAddress(validAddress)).toEqual(validAddress);
  });

  it("rejects invalid name, phone, lines, city, state, PIN and country", () => {
    expect(() => validateCreateAddress({ ...validAddress, name: "A" })).toThrow();
    expect(() => validateCreateAddress({ ...validAddress, phone: "1234567890" })).toThrow();
    expect(() => validateCreateAddress({ ...validAddress, line1: "x" })).toThrow();
    expect(() => validateCreateAddress({ ...validAddress, line2: "x".repeat(121) })).toThrow();
    expect(() => validateCreateAddress({ ...validAddress, city: "x" })).toThrow();
    expect(() => validateCreateAddress({ ...validAddress, state: "x" })).toThrow();
    expect(() => validateCreateAddress({ ...validAddress, postalCode: "12345" })).toThrow();
    expect(() => validateCreateAddress({ ...validAddress, country: "US" })).toThrow();
  });

  it("rejects ownership/default/timestamp mass-assignment fields", () => {
    for (const key of ["userId", "id", "isDefault", "createdAt", "updatedAt"] as const) {
      expect(() => validateCreateAddress({ ...validAddress, [key]: "attacker" })).toThrow(/invalid request field/i);
    }
    expect(() => validateUpdateAddress({ addressId: "address-1", city: "Pune", userId: "other-user" })).toThrow(/invalid request field/i);
    expect(() => validateAddressId({ addressId: "address-1", isDefault: true })).toThrow(/invalid request field/i);
  });

  it("requires an actual update and supports clearing line 2", () => {
    expect(() => validateUpdateAddress({ addressId: "address-1" })).toThrow(/at least one/i);
    expect(validateUpdateAddress({ addressId: "address-1", line2: null, state: "Telangana" })).toEqual({
      addressId: "address-1",
      patch: { line2: null, state: "Telangana" },
    });
  });
});

describe("address ownership and defaults", () => {
  it("generates unpredictable ids and makes only the first address default", () => {
    const first = createAddressForUser("user-a", validAddress);
    const second = createAddressForUser("user-a", { ...validAddress, label: "Work", line1: "55 Office Road" });

    expect(first.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(second.id).not.toBe(first.id);
    expect(first.isDefault).toBe(true);
    expect(second.isDefault).toBe(false);
    expect(listAddressRows("user-a").filter((a) => a.isDefault)).toHaveLength(1);
  });

  it("sets exactly one default within one user without affecting another user", () => {
    const a1 = createAddressForUser("user-a", validAddress);
    const a2 = createAddressForUser("user-a", { ...validAddress, label: "Work", line1: "55 Office Road" });
    const b1 = createAddressForUser("user-b", { ...validAddress, label: "User B" });

    setDefaultAddressForUser("user-a", a2.id);
    expect(requireOwnAddress("user-a", a1.id).isDefault).toBe(false);
    expect(requireOwnAddress("user-a", a2.id).isDefault).toBe(true);
    expect(requireOwnAddress("user-b", b1.id).isDefault).toBe(true);
  });

  it("prevents cross-user read, update, delete and default-setting IDOR", () => {
    const address = createAddressForUser("owner", validAddress);

    expect(() => requireOwnAddress("attacker", address.id)).toThrow(/not found/i);
    expect(() => updateAddressForUser("attacker", address.id, { city: "Mumbai" })).toThrow(/not found/i);
    expect(() => deleteAddressForUser("attacker", address.id)).toThrow(/not found/i);
    expect(() => setDefaultAddressForUser("attacker", address.id)).toThrow(/not found/i);
    expect(requireOwnAddress("owner", address.id).city).toBe("Bengaluru");
  });

  it("promotes one deterministic replacement when the default is deleted", () => {
    const first = createAddressForUser("user-a", validAddress);
    const second = createAddressForUser("user-a", { ...validAddress, label: "Work", line1: "55 Office Road" });
    createAddressForUser("user-a", { ...validAddress, label: "Parents", line1: "80 Family Road" });

    deleteAddressForUser("user-a", first.id);
    const remaining = listAddressRows("user-a");
    expect(remaining.filter((a) => a.isDefault)).toHaveLength(1);
    expect(requireOwnAddress("user-a", second.id).isDefault).toBe(true);
  });

  it("enforces the ten-address limit per user, not globally", () => {
    for (let i = 0; i < 10; i += 1) {
      createAddressForUser("user-a", { ...validAddress, label: `Place ${i}`, line1: `${i + 10} Example Road` });
    }
    expect(() => createAddressForUser("user-a", { ...validAddress, label: "Eleventh" })).toThrow(/at most 10/i);
    expect(() => createAddressForUser("user-b", validAddress)).not.toThrow();
  });

  it("updates allowed fields without changing ownership/default/id", () => {
    const address = createAddressForUser("owner", validAddress);
    const updated = updateAddressForUser("owner", address.id, {
      city: "Hyderabad",
      state: "Telangana",
      line2: null,
    });
    expect(updated).toMatchObject({
      id: address.id,
      userId: "owner",
      isDefault: true,
      city: "Hyderabad",
      state: "Telangana",
      line2: null,
    });
  });
});

describe("address response minimization", () => {
  it("returns owner postal fields but no internal account or timestamp fields", () => {
    const row = createAddressForUser("private-user-id", validAddress);
    const wire = JSON.stringify(toAddressDto(row));
    expect(wire).not.toContain("private-user-id");
    expect(wire).not.toContain("userId");
    expect(wire).not.toContain("createdAt");
    expect(wire).not.toContain("updatedAt");
    expect(wire).toContain("560034");
  });
});
