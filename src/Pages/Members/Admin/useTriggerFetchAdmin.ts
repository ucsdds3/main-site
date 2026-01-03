import { create } from "zustand";

interface TriggerState {
  triggerFetchAdmin: number;
  triggerFetchAdminNow: () => void;
}

export const useTriggerFetchAdmin = create<TriggerState>(set => ({
  triggerFetchAdmin: 0,
  triggerFetchAdminNow: () =>
    set(state => ({
      triggerFetchAdmin: state.triggerFetchAdmin + 1,
    })),
}));
