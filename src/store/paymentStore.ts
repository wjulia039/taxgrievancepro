import { create } from "zustand";

interface PaymentState {
  hasPaid: boolean;
  paymentId: string | null;
  isProcessing: boolean;
  setPaymentComplete: (paymentId: string) => void;
  setProcessing: (processing: boolean) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  hasPaid: false,
  paymentId: null,
  isProcessing: false,
  setPaymentComplete: (paymentId: string) => {
    set({ hasPaid: true, paymentId, isProcessing: false });
  },
  setProcessing: (processing: boolean) => {
    set({ isProcessing: processing });
  },
}));
