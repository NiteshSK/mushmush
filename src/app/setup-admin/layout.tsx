import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Setup Admin - MushMush',
  description: 'Create the first admin user for MushMush',
};

export default function SetupAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="setup-admin-layout">
      {children}
    </div>
  );
}
