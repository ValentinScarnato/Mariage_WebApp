"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mariage_guest_name";

export function useGuestName() {
  const [name, setNameState] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNameState(window.localStorage.getItem(STORAGE_KEY) ?? "");
    setReady(true);
  }, []);

  const setName = useCallback((value: string) => {
    setNameState(value);
    if (value.trim()) {
      window.localStorage.setItem(STORAGE_KEY, value.trim());
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { name, setName, ready };
}
