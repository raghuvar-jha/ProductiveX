import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DashboardLayout from "@/component/DashboardLayout";
import { Suspense } from "react";

// 1. This component is fast and static. Next.js serves it instantly.
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="fixed inset-0 h-screen w-screen bg-white flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600" />
    </div>}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}

// 2. This component does the async work safely inside the Suspense boundary.
async function AuthGate({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
