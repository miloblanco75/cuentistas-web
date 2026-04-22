"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "./UserContext";
import { FeedProvider } from "./FeedContext";
import { GuestProvider } from "./GuestContext";
import SpectatorBlocker from "./UI/SpectatorBlocker";
import HouseSelectionModal from "./Modals/HouseSelectionModal";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <UserProvider>
        <FeedProvider>
          <GuestProvider>
            <SpectatorBlocker />
            <HouseSelectionModal />
            {children}
          </GuestProvider>
        </FeedProvider>
      </UserProvider>
    </SessionProvider>
  );
}
