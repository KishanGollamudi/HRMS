// src/context/MessengerContext.jsx
import { createContext, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMessenger } from "@/hooks/useMessenger";

const MessengerContext = createContext(null);

export function MessengerProvider({ children }) {
  const { user } = useAuth();
  const messenger = useMessenger(user);
  return (
    <MessengerContext.Provider value={messenger}>
      {children}
    </MessengerContext.Provider>
  );
}

export const useMessengerContext = () => useContext(MessengerContext);
