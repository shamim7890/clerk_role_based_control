// app/dashboard/page.tsx
import { currentUser } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return null; // Middleware will redirect to sign-in
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2>Dashboard</h2>
      <p>Welcome, {user.emailAddresses[0].emailAddress}!</p>
    </div>
  );
}