import { useState, useEffect, createContext, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";

const UserIdContext = createContext<string | null>(null);

export function UserIdProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      let id = await SecureStore.getItemAsync("userToken");
      if (!id) {
        id = uuidv4();
        await SecureStore.setItemAsync("userToken", id);
      }
      setUserId(id);
    };
    loadUser();
  }, []);

  return (
    <UserIdContext.Provider value={userId}>
      {children}
    </UserIdContext.Provider>
  );
}

export function useUserId() {
  return useContext(UserIdContext);
}
