import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { getAuth } from '@workos/authkit-tanstack-react-start';
import AppLayout from '@/components/AppLayout';

export const Route = createFileRoute('/_authed/calendar')({
  component: RouteComponent,
  loader: async () => {
    const { user} = await getAuth();
  
    return { user };
    },
})

function RouteComponent() {
  const { user } = useLoaderData({ from: "/_authed/calendar" });
  return <AppLayout headerTitle={`Welcome, ${user?.firstName || "User"}`}>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome to your Calendar, {user?.firstName || "User"}
        </h2>
        <p className="text-muted-foreground">
          Here you can manage your calendar events and appointments.
        </p>
      </div>
    </div>
  </AppLayout>
}
