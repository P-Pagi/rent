"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { PushProvider } from "@/components/shared/PushProvider";

export interface Profile {
  name: string;
  email: string;
}

interface ProfileContextValue {
  profile: Profile;
  setProfile: (next: Profile) => void;
}

const STORAGE_KEY = "hana_admin_profile";
const DEFAULT_PROFILE: Profile = {
  name: "Admin",
  email: "admin@noyrent.cos",
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function ProfileStateProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.name && parsed?.email && parsed.name !== "Hana-chan") {
          setProfile({ name: String(parsed.name), email: String(parsed.email) });
          return;
        }
      } catch {
        // ignore invalid localStorage data
      }
    }

    if (session?.user?.name) {
      setProfile({
        name: session.user.name,
        email: session.user.email || "admin@noyrent.cos",
      });
    }
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const value = useMemo(() => ({ profile, setProfile }), [profile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileStateProvider>
        <PushProvider>{children}</PushProvider>
      </ProfileStateProvider>
    </SessionProvider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }
  return context;
}
