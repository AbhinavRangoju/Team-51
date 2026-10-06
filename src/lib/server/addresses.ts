/**
 * Address service.
 *
 * API handlers supply the authenticated session userId; every read/write here
 * scopes by that id again. Address IDs are CSPRNG UUIDs, but ownership checks—not
 * unpredictability—are the IDOR boundary.
 */

import { db, newId, nowIso, tx, type AddressRow } from "./db";
import { requireOwnAddress } from "./guards";
import { badRequest } from "./validate";

export const MAX_ADDRESSES_PER_USER = 10;

export type AddressInput = {
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: "IN";
};

export type AddressPatch = Partial<AddressInput>;

export function listAddressRows(userId: string): AddressRow[] {
  return [...db().t.addresses.values()]
    .filter((address) => address.userId === userId)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.createdAt.localeCompare(b.createdAt));
}

export function createAddressForUser(userId: string, input: AddressInput): AddressRow {
  return tx(() => {
    const existing = listAddressRows(userId);
    if (existing.length >= MAX_ADDRESSES_PER_USER) {
      throw badRequest(`You may save at most ${MAX_ADDRESSES_PER_USER} addresses.`);
    }

    const now = nowIso();
    const row: AddressRow = {
      id: newId(),
      userId,
      ...input,
      isDefault: existing.length === 0,
      createdAt: now,
      updatedAt: now,
    };
    db().t.addresses.set(row.id, row);
    return row;
  });
}

export function updateAddressForUser(userId: string, addressId: string, patch: AddressPatch): AddressRow {
  return tx(() => {
    const row = requireOwnAddress(userId, addressId);
    // Explicit field assignment only. userId/id/default/timestamps cannot be patched.
    if (patch.label !== undefined) row.label = patch.label;
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.phone !== undefined) row.phone = patch.phone;
    if (patch.line1 !== undefined) row.line1 = patch.line1;
    if (Object.prototype.hasOwnProperty.call(patch, "line2")) row.line2 = patch.line2 ?? null;
    if (patch.city !== undefined) row.city = patch.city;
    if (patch.state !== undefined) row.state = patch.state;
    if (patch.postalCode !== undefined) row.postalCode = patch.postalCode;
    if (patch.country !== undefined) row.country = patch.country;
    row.updatedAt = nowIso();
    return row;
  });
}

export function setDefaultAddressForUser(userId: string, addressId: string): AddressRow {
  return tx(() => {
    const target = requireOwnAddress(userId, addressId);
    for (const address of db().t.addresses.values()) {
      if (address.userId === userId) address.isDefault = address.id === target.id;
    }
    target.updatedAt = nowIso();
    return target;
  });
}

export function deleteAddressForUser(userId: string, addressId: string): void {
  tx(() => {
    const target = requireOwnAddress(userId, addressId);
    db().t.addresses.delete(target.id);

    if (target.isDefault) {
      const replacement = listAddressRows(userId)[0];
      if (replacement) {
        replacement.isDefault = true;
        replacement.updatedAt = nowIso();
      }
    }
  });
}
