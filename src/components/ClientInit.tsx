"use client";

import { useEffect } from "react";

export default function ClientInit() {
  useEffect(() => {
    try {
      if (localStorage.getItem("ef_theme") === "dark") {
        document.documentElement.classList.add("dark");
      }
    } catch {}
    if (location.hostname !== "localhost" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);
  return null;
}
