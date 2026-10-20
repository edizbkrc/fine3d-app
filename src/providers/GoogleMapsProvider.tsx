"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const LIBRARIES: ("places" | "geometry")[] = ["places"];

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export const useGoogleMapsLoader = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error("useGoogleMapsLoader must be used within GoogleMapsProvider");
  }
  return context;
};

let globalLanguage: string | undefined;

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language] = useState(() => {

    if (!globalLanguage) {

      if (typeof window !== "undefined") {
        globalLanguage = localStorage.getItem("userLanguage") || navigator.language.split("-")[0] || "en";
      } else {
        globalLanguage = "en";
      }
    }
    return globalLanguage;
  });

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
    language: language,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
