"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "./UserContext";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </SessionProvider>
  );
}
