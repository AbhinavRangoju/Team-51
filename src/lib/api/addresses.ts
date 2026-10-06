/**
 * Authenticated address APIs.
 *
 * Requests never contain a userId. The handler resolves the session user and
 * passes only that identity to the address service, which repeats ownership
 * checks for every id-based operation.
 */

import { createServerFn } from "@tanstack/react-start";

import type { AddressInput, AddressPatch } from "@/lib/server/addresses";
import type { AddressDto } from "@/lib/server/dto";
import {
  badRequest,
  guarded,
  oneOf,
  optionalStr,
  phone as parsePhone,
  pin as parsePin,
  str,
  strictObj,
} from "@/lib/server/validate";

const COUNTRIES = ["IN"] as const;
const ADDRESS_FIELDS = [
  "label",
  "name",
  "phone",
  "line1",
  "line2",
  "city",
  "state",
  "postalCode",
  "country",
] as const;

function hasOwn(body: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, key);
}

function parseIndianPhone(raw: unknown): string {
  const value = parsePhone(raw);
  if (!/^[6-9]\d{9}$/.test(value)) throw badRequest("Enter a valid Indian mobile number.");
  return value;
}

function parseCountry(raw: unknown): "IN" {
  return oneOf(typeof raw === "string" ? raw.toUpperCase() : raw, COUNTRIES, "Country");
}

function parseLine2(raw: unknown): string | null {
  return optionalStr(raw, "Address line 2", { max: 120 });
}

/** Exported for focused security tests. */
export function validateCreateAddress(raw: unknown): AddressInput {
  const body = strictObj(raw, ADDRESS_FIELDS);
  return {
    label: str(body.label, "Label", { min: 1, max: 30 }),
    name: str(body.name, "Recipient name", { min: 2, max: 80 }),
    phone: parseIndianPhone(body.phone),
    line1: str(body.line1, "Address line 1", { min: 5, max: 120 }),
    line2: parseLine2(body.line2),
    city: str(body.city, "City", { min: 2, max: 80 }),
    state: str(body.state, "State", { min: 2, max: 80 }),
    postalCode: parsePin(body.postalCode),
    country: parseCountry(body.country),
  };
}

/** Exported for focused security tests. */
export function validateUpdateAddress(raw: unknown): { addressId: string; patch: AddressPatch } {
  const body = strictObj(raw, ["addressId", ...ADDRESS_FIELDS]);
  const patch: AddressPatch = {};

  if (hasOwn(body, "label")) patch.label = str(body.label, "Label", { min: 1, max: 30 });
  if (hasOwn(body, "name")) patch.name = str(body.name, "Recipient name", { min: 2, max: 80 });
  if (hasOwn(body, "phone")) patch.phone = parseIndianPhone(body.phone);
  if (hasOwn(body, "line1")) patch.line1 = str(body.line1, "Address line 1", { min: 5, max: 120 });
  if (hasOwn(body, "line2")) patch.line2 = parseLine2(body.line2);
  if (hasOwn(body, "city")) patch.city = str(body.city, "City", { min: 2, max: 80 });
  if (hasOwn(body, "state")) patch.state = str(body.state, "State", { min: 2, max: 80 });
  if (hasOwn(body, "postalCode")) patch.postalCode = parsePin(body.postalCode);
  if (hasOwn(body, "country")) patch.country = parseCountry(body.country);
  if (Object.keys(patch).length === 0) throw badRequest("Provide at least one address change.");

  return {
    addressId: str(body.addressId, "Address", { min: 1, max: 64 }),
    patch,
  };
}

/** Exported for focused security tests. */
export function validateAddressId(raw: unknown): { addressId: string } {
  const body = strictObj(raw, ["addressId"]);
  return { addressId: str(body.addressId, "Address", { min: 1, max: 64 }) };
}

export const getMyAddresses = createServerFn({ method: "GET" }).handler(async (): Promise<AddressDto[]> =>
  guarded(async () => {
    const [{ requireUser }, { listAddressRows }, { toAddressDto }, { seedIfEmpty }] = await Promise.all([
      import("@/lib/server/guards"),
      import("@/lib/server/addresses"),
      import("@/lib/server/dto"),
      import("@/lib/server/seed"),
    ]);
    seedIfEmpty();
    const user = await requireUser();
    return listAddressRows(user.id).map(toAddressDto);
  }),
);

export const createAddress = createServerFn({ method: "POST" })
  .validator(validateCreateAddress)
  .handler(async ({ data }): Promise<AddressDto> =>
    guarded(async () => {
      const [{ requireUser }, { createAddressForUser }, { toAddressDto }, { seedIfEmpty }] = await Promise.all([
        import("@/lib/server/guards"),
        import("@/lib/server/addresses"),
        import("@/lib/server/dto"),
        import("@/lib/server/seed"),
      ]);
      seedIfEmpty();
      const user = await requireUser();
      return toAddressDto(createAddressForUser(user.id, data));
    }),
  );

export const updateAddress = createServerFn({ method: "POST" })
  .validator(validateUpdateAddress)
  .handler(async ({ data }): Promise<AddressDto> =>
    guarded(async () => {
      const [{ requireUser }, { updateAddressForUser }, { toAddressDto }, { seedIfEmpty }] = await Promise.all([
        import("@/lib/server/guards"),
        import("@/lib/server/addresses"),
        import("@/lib/server/dto"),
        import("@/lib/server/seed"),
      ]);
      seedIfEmpty();
      const user = await requireUser();
      return toAddressDto(updateAddressForUser(user.id, data.addressId, data.patch));
    }),
  );

export const deleteAddress = createServerFn({ method: "POST" })
  .validator(validateAddressId)
  .handler(async ({ data }): Promise<{ ok: true }> =>
    guarded(async () => {
      const [{ requireUser }, { deleteAddressForUser }, { seedIfEmpty }] = await Promise.all([
        import("@/lib/server/guards"),
        import("@/lib/server/addresses"),
        import("@/lib/server/seed"),
      ]);
      seedIfEmpty();
      const user = await requireUser();
      deleteAddressForUser(user.id, data.addressId);
      return { ok: true };
    }),
  );

export const setDefaultAddress = createServerFn({ method: "POST" })
  .validator(validateAddressId)
  .handler(async ({ data }): Promise<AddressDto> =>
    guarded(async () => {
      const [{ requireUser }, { setDefaultAddressForUser }, { toAddressDto }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/guards"),
          import("@/lib/server/addresses"),
          import("@/lib/server/dto"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();
      const user = await requireUser();
      return toAddressDto(setDefaultAddressForUser(user.id, data.addressId));
    }),
  );
