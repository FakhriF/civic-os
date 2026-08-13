import { describe, expect, test } from "bun:test";
import {
  AnnouncementService,
  AnnouncementTransitionError,
  type AnnouncementStatus,
} from "../../modules/announcement/announcement.service";

const statuses: AnnouncementStatus[] = ["draft", "published", "archived"];
const targets = ["published", "archived"] as const;

const validTransitions: Array<[AnnouncementStatus, "published" | "archived"]> =
  [
    ["draft", "published"],
    ["published", "archived"],
    ["archived", "published"], // republish
  ];

describe("AnnouncementService.assertTransition", () => {
  for (const [from, to] of validTransitions) {
    test(`allows ${from} → ${to}`, () => {
      expect(() =>
        AnnouncementService.assertTransition(from, to),
      ).not.toThrow();
    });
  }

  for (const from of statuses) {
    for (const to of targets) {
      if (validTransitions.some(([a, b]) => a === from && b === to)) continue;
      test(`rejects ${from} → ${to}`, () => {
        expect(() => AnnouncementService.assertTransition(from, to)).toThrow(
          AnnouncementTransitionError,
        );
      });
    }
  }
});
