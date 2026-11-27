import { create } from "zustand";
import type { OnboardingTask, PendingMaterials } from "../types";
export type OnboardingDraft = {
  taskId: string;
  checklist: OnboardingTask["checklist"];
  pending: boolean;
  meta: PendingMaterials | null;
};
export const useEmployeeDraft = create<{
  onboarding: OnboardingDraft | null;
  creationKey: string | null;
  busy: boolean;
  writeId: string | null;
}>(() => ({ onboarding: null, creationKey: null, busy: false, writeId: null }));
