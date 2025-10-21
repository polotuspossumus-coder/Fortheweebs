import { createContext, useContext } from 'react';

const TierContext = createContext();

export function TierProvider({ children }) {
  const tier = 'Mythic Founder'; // Replace with dynamic logic
  return <TierContext.Provider value={{ tier }}>{children}</TierContext.Provider>;
}

export function useTier() {
  return useContext(TierContext);
}
