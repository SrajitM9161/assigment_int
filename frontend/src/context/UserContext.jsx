// src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const storedId = localStorage.getItem('sessionId');
    const storedName = localStorage.getItem('name');
    if (storedId) setSessionId(storedId);
    if (storedName) setName(storedName);
  }, []);

  const saveUser = (id, userName) => {
    setSessionId(id);
    setName(userName);
    localStorage.setItem('sessionId', id);
    localStorage.setItem('name', userName);
  };

  return (
    <UserContext.Provider value={{ sessionId, name, saveUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
