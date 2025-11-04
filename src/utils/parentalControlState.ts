// src/utils/parentalControlState.ts
// Minimal in-memory parental control state for legal compliance only

export type ParentalControlState = {
  enabled: boolean;
  timestamp: string;
  triggeredBy: "user" | "parent";
};

let parentalControl: ParentalControlState = {
  enabled: false,
  timestamp: "",
  triggeredBy: "user",
};

export const enableParentalControls = (triggeredBy: "user" | "parent") => {
  parentalControl = {
    enabled: true,
    timestamp: new Date().toISOString(),
    triggeredBy,
  };
};

export const disableParentalControls = () => {
  parentalControl = {
    enabled: false,
    timestamp: new Date().toISOString(),
    triggeredBy: "user",
  };
};

export const getParentalControlStatus = () => parentalControl;
