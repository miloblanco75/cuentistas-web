"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "./UserContext";
import SpectatorBlocker from "./UI/SpectatorBlocker";
import HouseSelectionModal from "./Modals/HouseSelectionModal";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <UserProvider>
        <SpectatorBlocker />
        <HouseSelectionModal />
        {children}
      </UserProvider>
    </SessionProvider>
  );
}
