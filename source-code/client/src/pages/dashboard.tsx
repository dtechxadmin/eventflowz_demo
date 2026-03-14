import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, BarChart3, Users, DollarSign, Plus } from "lucide-react";
import AppShell from "@/components/layouts/AppShell";
import EventsTable from "@/components/dashboard/EventsTable";
import EventFilters from "@/components/dashboard/EventFilters";
import { useAuth } from "@/hooks/use-auth";
import { DateRange } from "react-day-picker";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [teamMemberFilter, setTeamMemberFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: contacts, isLoading: isContactsLoading } = useQuery({
    queryKey: ["/api/contacts"],
  });

  // Summary stats
  const totalEvents = Array.isArray(events) ? events.length : 0;
  const upcomingEvents = Array.isArray(events) ? events.filter(
    (event: any) => new Date(event.date) > new Date()
  ).length : 0;
  const activeClients = Array.isArray(contacts) ? contacts.filter(
    (contact: any) => contact.type === "client"
  ).length : 0;

  return (
    <AppShell
      title="Dashboard"
      actions={
        user?.role !== "team_member" ? (
          <Link href="/intake">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </Link>
        ) : null
      }
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {isEventsLoading ? "Loading..." : "All time events"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              {isEventsLoading ? "Loading..." : "Events in the future"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              {isContactsLoading ? "Loading..." : "Current clients"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Events</h2>
          <Link href="/events">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <EventFilters
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onEventTypeChange={setEventTypeFilter}
          onTeamMemberChange={setTeamMemberFilter}
          onDateRangeChange={setDateRange}
        />

        <div className="mt-4">
          <EventsTable
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            eventTypeFilter={eventTypeFilter}
            teamMemberFilter={teamMemberFilter}
            dateRange={dateRange ? {
              from: dateRange.from,
              to: dateRange.to || undefined
            } : undefined}
            viewMode="all"
            leadStatuses={[
              "inquiry",
              "follow_up", 
              "icm",
              "proposal",
              "pay_retainer"
            ]}
          />
        </div>
      </div>
    </AppShell>
  );
}
