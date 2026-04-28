import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Topbar userEmail={user.email} />

      {children}

      <Footer />
    </main>
  );
}