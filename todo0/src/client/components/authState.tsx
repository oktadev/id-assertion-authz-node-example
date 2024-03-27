import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface AuthState {
  name: string | undefined;
  isAuthenticated?: boolean;
}

const defaultAuthState: AuthState = {
  name: undefined,
  isAuthenticated: undefined,
};

export type AuthContextType = {
  authState: AuthState;
  userIsAuthenticatedFn: () => Promise<void>;
  onRevokeAuthFn: () => Promise<void>;
  onUsernameEnteredFn: (username: string) => Promise<number | null>;
};

const defaultAuthContext: AuthContextType = {
  authState: defaultAuthState,
  userIsAuthenticatedFn: async () => {},
  onRevokeAuthFn: async () => {},
  onUsernameEnteredFn: async () => null,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);
export const useAuthState = () => useContext(AuthContext);

type Props = {
  children: ReactNode;
};

const AuthContextProvider: React.FC<Props> = function ({ children }: Props) {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  const userIsAuthenticatedFn = useCallback(async () => {
    const url = `/api/users/me`;
    try {
      const res = await fetch(url, {
        credentials: 'same-origin',
        mode: 'same-origin',
      });

      if (res.status === 200) {
        const { name } = await res.json();
        setAuthState({ name, isAuthenticated: true });
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        setAuthState({ name: undefined, isAuthenticated: false });
        localStorage.setItem('isAuthenticated', 'false');
      }
    } catch (error: unknown) {
      setAuthState(defaultAuthState);
      console.error(error);
    }
  }, [setAuthState]);

  const onRevokeAuthFn = async () => {
    const url = `/api/openid/signout`;
    try {
      await fetch(url, {
        method: 'POST',
      });

      setAuthState({ isAuthenticated: false, name: undefined });
      localStorage.setItem('isAuthenticated', 'false');
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const onUsernameEnteredFn = async (username: string) => {
    const url = `/api/openid/check`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const { orgId } = await res.json();

      return orgId;
    } catch (error: unknown) {
      console.error(error);
    }

    return null;
  };

  const authContextValue = useMemo(
    () => ({ authState, onRevokeAuthFn, userIsAuthenticatedFn, onUsernameEnteredFn }),
    [authState, userIsAuthenticatedFn]
  );
  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
