/**
 * Vendor registration and profile APIs.
 *
 * applyForVendor / getVendorApplicationStatus operate on the applicant's own
 * application and never confer privileges. getMyVendorProfile /
 * updateMyVendorProfile operate on the caller's already-approved vendor record
 * via requireVendor(), which scopes to the session user — no vendorId is ever
 * accepted from a request.
 *
 * Status, verification, approval, role, ownership and rating are all
 * server-controlled; none has a validator, so none can be sent.
 */

import { createServerFn } from "@tanstack/react-start";

import type { VendorApplicationInput } from "@/lib/server/vendor-applications";
import type { VendorApplicationDto, VendorDto } from "@/lib/server/dto";
import { badRequest, guarded, oneOf, phone as parsePhone, str, strictObj } from "@/lib/server/validate";

const CATEGORY_SLUGS = [
  "fashion",
  "electronics",
  "home",
  "beauty",
  "sports",
  "accessories",
  "books",
  "grocery",
] as const;

function parseIndianPhone(raw: unknown): string {
  const value = parsePhone(raw);
  if (!/^[6-9]\d{9}$/.test(value)) throw badRequest("Enter a valid Indian mobile number.");
  return value;
}

/** Exported for focused security tests. */
export function validateVendorApplication(raw: unknown): VendorApplicationInput {
  const body = strictObj(raw, ["storeName", "description", "category", "phone", "city"]);
  return {
    storeName: str(body.storeName, "Store name", { min: 3, max: 80 }),
    description: str(body.description, "Description", { min: 20, max: 2_000 }),
    category: oneOf(body.category, CATEGORY_SLUGS, "Category"),
    phone: parseIndianPhone(body.phone),
    city: str(body.city, "City", { min: 2, max: 80 }),
  };
}

type ProfilePatch = { name?: string; tagline?: string; city?: string };

/** Exported for focused security tests. Only safe display fields are editable. */
export function validateVendorProfilePatch(raw: unknown): ProfilePatch {
  const body = strictObj(raw, ["name", "tagline", "city"]);
  const patch: ProfilePatch = {};
  if (Object.prototype.hasOwnProperty.call(body, "name")) patch.name = str(body.name, "Store name", { min: 3, max: 80 });
  if (Object.prototype.hasOwnProperty.call(body, "tagline")) patch.tagline = str(body.tagline, "Tagline", { min: 2, max: 160 });
  if (Object.prototype.hasOwnProperty.call(body, "city")) patch.city = str(body.city, "City", { min: 2, max: 80 });
  if (Object.keys(patch).length === 0) throw badRequest("Provide at least one profile change.");
  return patch;
}

export const applyForVendor = createServerFn({ method: "POST" })
  .validator(validateVendorApplication)
  .handler(async ({ data }): Promise<VendorApplicationDto> =>
    guarded(async () => {
      const [{ requireUser }, { createApplicationForUser }, { toVendorApplicationDto }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/guards"),
          import("@/lib/server/vendor-applications"),
          import("@/lib/server/dto"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();
      // Any authenticated user may apply; the role stays whatever it is until an
      // admin approves. We do not gate on role here so an existing seller gets a
      // clean "already a vendor" conflict rather than a generic forbidden.
      const user = await requireUser();
      return toVendorApplicationDto(createApplicationForUser(user.id, data));
    }),
  );

export const getVendorApplicationStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<VendorApplicationDto | null> =>
    guarded(async () => {
      const [{ requireUser }, { findApplicationByUser }, { toVendorApplicationDto }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/guards"),
          import("@/lib/server/vendor-applications"),
          import("@/lib/server/dto"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();
      const user = await requireUser();
      const application = findApplicationByUser(user.id);
      return application ? toVendorApplicationDto(application) : null;
    }),
);

export const getMyVendorProfile = createServerFn({ method: "GET" }).handler(async (): Promise<VendorDto> =>
  guarded(async () => {
    const [{ requireVendor }, { toVendorDto }, { seedIfEmpty }] = await Promise.all([
      import("@/lib/server/guards"),
      import("@/lib/server/dto"),
      import("@/lib/server/seed"),
    ]);
    seedIfEmpty();
    // requireVendor resolves the store from the session user. There is no
    // vendorId parameter, so one vendor cannot read another's profile.
    const { vendor } = await requireVendor();
    return toVendorDto(vendor);
  }),
);

export const updateMyVendorProfile = createServerFn({ method: "POST" })
  .validator(validateVendorProfilePatch)
  .handler(async ({ data }): Promise<VendorDto> =>
    guarded(async () => {
      const [{ db, tx }, { requireVendor }, { toVendorDto }, { seedIfEmpty }] = await Promise.all([
        import("@/lib/server/db"),
        import("@/lib/server/guards"),
        import("@/lib/server/dto"),
        import("@/lib/server/seed"),
      ]);
      seedIfEmpty();
      const { vendor } = await requireVendor();

      return tx(() => {
        const row = db().t.vendors.get(vendor.id);
        if (!row) throw badRequest("Vendor profile not found.");
        // Explicit assignment of display fields only. status, verified, rating,
        // since, userId and id are never touched here.
        if (data.name !== undefined) row.name = data.name;
        if (data.tagline !== undefined) row.tagline = data.tagline;
        if (data.city !== undefined) row.city = data.city;
        return toVendorDto(row);
      });
    }),
  );
