import { useParams } from "wouter";
import AppShell from "@/components/layouts/AppShell";
import EventDetail from "@/components/events/EventDetail";

export default function EventDetailPage() {
  const { id } = useParams();
  
  return (
    <AppShell title={`Event Details`}>
      <EventDetail />
    </AppShell>
  );
}
