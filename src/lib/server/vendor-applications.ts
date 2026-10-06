/**
 * Vendor application service.
 *
 * A vendor application is deliberately separate from a VendorRow. Submitting one
 * never grants vendor privileges: the applicant keeps the "customer" role and
 * gains nothing a vendor can do until an admin review (Phase 5) approves it.
 * Status here is server-controlled; no customer path can set or change it.
 */

import { db, newId, nowIso, tx, type VendorApplicationRow } from "./db";
import { badRequest, conflict } from "./validate";

export type VendorApplicationInput = {
  storeName: string;
  description: string;
  category: string;
  phone: string;
  city: string;
};

export function findApplicationByUser(userId: string): VendorApplicationRow | undefined {
  return [...db().t.vendorApplications.values()].find((a) => a.userId === userId);
}

export function userIsVendor(userId: string): boolean {
  return [...db().t.vendors.values()].some((v) => v.userId === userId);
}

/**
 * Creates a Pending application for a customer.
 *
 * Rejected if the user already sells (has a linked vendor) or already has an
 * application in any state. Status, reviewer and timestamps are all server-set.
 */
export function createApplicationForUser(userId: string, input: VendorApplicationInput): VendorApplicationRow {
  return tx(() => {
    if (userIsVendor(userId)) {
      throw conflict("You already have a vendor account.");
    }
    if (findApplicationByUser(userId)) {
      throw conflict("You already have a vendor application on file.");
    }

    const now = nowIso();
    const row: VendorApplicationRow = {
      id: newId(),
      userId,
      storeName: input.storeName,
      description: input.description,
      category: input.category,
      phone: input.phone,
      city: input.city,
      // Not negotiable and not read from the request.
      status: "Pending",
      reviewedByUserId: null,
      reviewedAt: null,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    };
    db().t.vendorApplications.set(row.id, row);
    return row;
  });
}

/**
 * Admin review transition (used by Phase 5 admin APIs, not by any customer path).
 * Exported now so the status machine lives in one place and is test-covered.
 */
export function reviewApplication(
  applicationId: string,
  decision: "Approved" | "Rejected",
  reviewerUserId: string,
  rejectionReason: string | null,
): VendorApplicationRow {
  return tx(() => {
    const app = db().t.vendorApplications.get(applicationId);
    if (!app) throw badRequest("Application not found.");
    if (app.status !== "Pending") {
      throw conflict("This application has already been reviewed.");
    }
    app.status = decision;
    app.reviewedByUserId = reviewerUserId;
    app.reviewedAt = nowIso();
    app.rejectionReason = decision === "Rejected" ? rejectionReason : null;
    app.updatedAt = app.reviewedAt;
    return app;
  });
}
