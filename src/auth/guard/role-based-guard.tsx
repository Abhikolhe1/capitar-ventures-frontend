import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

//
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type Props = {
  hasContent?: boolean;
  roles?: string[];
  children: ReactNode;
  sx?: SxProps<Theme>;
};

export default function RoleBasedGuard({ hasContent, roles, children, sx }: Props) {
  const { user } = useAuthContext();

  const currentRole = user?.role;

  if (typeof roles !== 'undefined' && !roles.includes(currentRole || '')) {
    return hasContent ? (
      <Container sx={{ textAlign: 'center', ...sx }}>
        <Typography variant="h3" paragraph>
          Permission Denied
        </Typography>

        <Typography sx={{ color: 'text.secondary' }}>
          You do not have permission to access this page
        </Typography>
      </Container>
    ) : null;
  }

  return <> {children} </>;
}
