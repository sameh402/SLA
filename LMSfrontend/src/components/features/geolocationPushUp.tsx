// src/components/features/GeolocationPopup.tsx
import { useState } from "react";
import { useLocationStore } from "@/lib/locationStore";

// Custom hook for Egypt detection
const useEgyptDetection = () => {
  const [geoError, setGeoError] = useState<string | null>(null);
  const setEgyptUser = useLocationStore((s) => s.setIsEgyptUser);

  const checkIfEgypt = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const isEgypt = data.address?.country === "Egypt";
      setEgyptUser(isEgypt);
      return isEgypt;
    } catch {
      setGeoError("Failed to detect country.");
      setEgyptUser(false);
      return false;
    }
  };

  const detectEgypt = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported.");
      setEgyptUser(false);
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const isEg = await checkIfEgypt(pos.coords.latitude, pos.coords.longitude);
          resolve(isEg);
        },
        () => {
          setGeoError("Location access denied.");
          setEgyptUser(false);
          resolve(false);
        }
      );
    });
  };

  return { geoError, detectEgypt };
};

const GeolocationPopup = () => {
  const isEgyptUser = useLocationStore((s) => s.isEgyptUser);
  const setEgyptUser = useLocationStore((s) => s.setIsEgyptUser);

  const [showLocationRequest, setShowLocationRequest] = useState(() => isEgyptUser === null);
  const [showCurrencyReminder, setShowCurrencyReminder] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { geoError, detectEgypt } = useEgyptDetection();

  const requestLocation = async () => {
    setIsProcessing(true);
    setShowLocationRequest(false);
    await detectEgypt();
    setIsProcessing(false);
    setShowCurrencyReminder(true);
  };

  const handleDeny = () => {
    setEgyptUser(false);
    setShowLocationRequest(false);
    setShowCurrencyReminder(true);
  };

  const openLocationSettings = async () => {
    setIsProcessing(true);
    setShowCurrencyReminder(false);
    await detectEgypt();
    setIsProcessing(false);
    setShowCurrencyReminder(true);
  };

  const closeAllPopups = () => {
    setShowCurrencyReminder(false);
  };

  // If already detected and no popups, render nothing
  if (!showLocationRequest && !showCurrencyReminder && !isProcessing) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {(showLocationRequest || showCurrencyReminder || isProcessing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" />
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-8 rounded-xl shadow-xl w-full max-w-lg border border-border">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-center text-card-foreground">
              Detecting your location...
            </h3>
            <p className="text-muted-foreground text-center">
              Please wait while we determine your country.
            </p>
          </div>
        </div>
      )}

      {/* Location Request */}
      {showLocationRequest && !isProcessing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-8 rounded-xl shadow-xl w-full max-w-lg border border-border">
            <h3 className="text-2xl font-bold mb-4 text-center text-card-foreground">Enable Location?</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Allow access for local currency pricing.
            </p>
            <div className="flex justify-between gap-4">
              <button
                onClick={handleDeny}
                className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Deny
              </button>
              <button
                onClick={requestLocation}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Reminder */}
      {showCurrencyReminder && !isProcessing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-8 rounded-xl shadow-xl w-full max-w-lg border border-border">
            <h3 className="text-2xl font-bold mb-4 text-center text-card-foreground">
              {isEgyptUser ? "Local Pricing Enabled" : "Prices in USD"}
            </h3>
            <p className="text-muted-foreground mb-6 text-center">
              {isEgyptUser
                ? "You’ll now see prices in EGP."
                : "You’re viewing prices in USD."}
            </p>
            {geoError && (
              <p className="text-warning mb-4 text-center">{geoError}</p>
            )}
            <div className="flex justify-center gap-4">
              {!isEgyptUser && (
                <button
                  onClick={openLocationSettings}
                  className="px-6 py-3 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors"
                >
                  Allow Location
                </button>
              )}
              <button
                onClick={closeAllPopups}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeolocationPopup;