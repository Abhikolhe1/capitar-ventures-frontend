import type { ReactNode } from 'react';

//
import { AuthContext } from './auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
};

export function AuthConsumer({ children }: Props) {
  return (
    <AuthContext.Consumer>
      {(auth) => (auth.loading ? null : children)}
    </AuthContext.Consumer>
  );
}
