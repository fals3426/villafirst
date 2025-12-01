import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingData {
  vibe?: string;
  lifestyle?: string[];
  rythme?: string;
  arrivalDate?: string;
  budget?: number;
  zones?: string[];
  duration?: string;
}

interface BookingData {
  villaId: string;
  villaName: string;
  prixParPersonne: number;
  vibe: string;
  dates: string;
  bookingFee: number;
  paid: boolean;
}

interface AppState {
  onboardingData: OnboardingData | null;
  bookingData: BookingData | null;
  currentUserId: string;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  setBookingData: (data: BookingData) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingData: null,
      bookingData: null,
      currentUserId: "user_" + Math.random().toString(36).substr(2, 9),
      setOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...(state.onboardingData ?? {}), ...data },
        })),
      setBookingData: (data) => set({ bookingData: data }),
    }),
    {
      name: "coloc-bali-storage",
    }
  )
);









