"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const FeedContext = createContext();

/**
 * FeedProvider - Phase 11 V3 RC
 * Optimized context to track the active/visible story in the feed.
 * Prevents unnecessary re-renders using functional updates.
 */
export function FeedProvider({ children }) {
    const [activeEntryId, setInternalActiveEntryId] = useState(null);

    const setActiveEntryId = useCallback((newId) => {
        setInternalActiveEntryId((prev) => {
            if (prev === newId) return prev;
            return newId;
        });
    }, []);

    return (
        <FeedContext.Provider value={{ activeEntryId, setActiveEntryId }}>
            {children}
        </FeedContext.Provider>
    );
}

export function useFeed() {
    const context = useContext(FeedContext);
    if (!context) {
        throw new Error("useFeed must be used within a FeedProvider");
    }
    return context;
}
