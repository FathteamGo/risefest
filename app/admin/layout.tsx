import Layout from '../../components/Layout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout isAdmin={true}>
      {children}
    </Layout>
  );
}