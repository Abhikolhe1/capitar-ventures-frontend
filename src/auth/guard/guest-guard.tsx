import type { ReactNode } from 'react';

import { useEffect, useCallback } from 'react';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

//
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
};

export default function GuestGuard({ children }: Props) {
  const router = useRouter();

  const { authenticated, loading } = useAuthContext();

  const check = useCallback(() => {
    if (loading) {
      return;
    }

    if (authenticated) {
      router.replace(paths.dashboard.root);
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}
