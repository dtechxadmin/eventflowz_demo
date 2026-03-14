import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Plus,
  SlidersHorizontal,
  User
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AppShell from "@/components/layouts/AppShell";
import EventsTable from "@/components/dashboard/EventsTable";
import EventFilters from "@/components/dashboard/EventFilters";
import { DateRange } from "react-day-picker";

// Leads are events with these statuses
const LEAD_STATUSES = ["inquiry", "follow_up", "icm", "proposal", "pay_retainer"];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [teamMemberFilter, setTeamMemberFilter] = useState("");
  const [contactFilter, setContactFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"all" | "leads" | "events">("all");
  const [showFilters, setShowFilters] = useState(true);
  
  // Handle toggle value change
  const handleViewModeChange = (value: string) => {
    setViewMode(value as "all" | "leads" | "events");
    // Reset status filter when switching views
    setStatusFilter("");
  };
  
  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <AppShell
      title={
        <div className="flex items-center gap-2">
          <span>Events</span>
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <Link href="/intake">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        {/* View toggle buttons - always visible */}
        <div className="mb-4">
          <div className="flex items-center">
            <ToggleGroup 
              type="single" 
              value={viewMode}
              onValueChange={handleViewModeChange} 
              className="justify-start border rounded-md p-1 w-fit"
            >
              <ToggleGroupItem 
                value="all" 
                className="text-sm px-4 py-2 font-medium data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900"
              >
                All
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="leads" 
                className="text-sm px-4 py-2 font-medium data-[state=on]:bg-green-100 data-[state=on]:text-green-900"
              >
                Leads
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="events" 
                className="text-sm px-4 py-2 font-medium data-[state=on]:bg-purple-100 data-[state=on]:text-purple-900"
              >
                Events
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Search bar is always visible */}
        <EventFilters
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onEventTypeChange={setEventTypeFilter}
          onTeamMemberChange={setTeamMemberFilter}
          onDateRangeChange={setDateRange}
          onContactChange={setContactFilter}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onToggleFilters={toggleFilters}
          showFilters={showFilters}
        />

        <EventsTable
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          eventTypeFilter={eventTypeFilter}
          teamMemberFilter={teamMemberFilter}
          contactFilter={contactFilter}
          dateRange={dateRange ? {
            from: dateRange.from, 
            to: dateRange.to
          } : undefined}
          startDate={startDate}
          endDate={endDate}
          viewMode={viewMode}
          leadStatuses={LEAD_STATUSES}
        />
      </div>
    </AppShell>
  );
}
