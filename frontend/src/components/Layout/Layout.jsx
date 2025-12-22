import Navbar from '../components/Dashboard/Navbar';
import Sidebar from '../components/Dashboard/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: '220px', transition: 'margin-left 0.3s ease' }}>
        <Navbar />
        <main style={{ padding: 20 }}>{children}</main>
      </div>
    </>
  );
}
