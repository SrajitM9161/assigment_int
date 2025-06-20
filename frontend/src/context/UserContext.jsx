import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => {
    const id = sessionStorage.getItem('sessionId');
    const storedName = sessionStorage.getItem('name');

    if (id && storedName) {
      setSessionId(id);
      setName(storedName);
    }
  }, []);

  const saveUser = (id, userName) => {
    sessionStorage.setItem('sessionId', id);
    sessionStorage.setItem('name', userName);
    setSessionId(id);
    setName(userName);
  };

  return (
    <UserContext.Provider value={{ sessionId, name, saveUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
export { UserContext };
