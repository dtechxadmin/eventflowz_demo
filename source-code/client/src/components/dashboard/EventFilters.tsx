import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Search, Filter, Eye, EyeOff, SlidersHorizontal } from "lucide-react";
import { eventStatuses, eventTypes } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { SearchableCombobox, type ComboboxOption } from "@/components/ui/searchable-combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EventFiltersProps {
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
  onEventTypeChange: (type: string) => void;
  onTeamMemberChange: (member: string) => void;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  onContactChange?: (contact: string) => void;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  onToggleFilters?: () => void;
  showFilters?: boolean;
}

export default function EventFilters({
  onSearchChange,
  onStatusChange,
  onEventTypeChange,
  onTeamMemberChange,
  onDateRangeChange,
  onContactChange,
  onStartDateChange,
  onEndDateChange,
  onToggleFilters,
  showFilters
}: EventFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<string>("");
  
  // Fetch team members data
  const { data: teamMembersData } = useQuery({
    queryKey: ["/api/team-members"],
    // Return empty array if API endpoint doesn't exist yet
    queryFn: () => fetch("/api/team-members").then(res => {
      if (res.ok) return res.json();
      return [];
    }).catch(() => [])
  });
  
  // Fetch contacts data
  const { data: contactsData = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
  });
  
  // Format team members data for the dropdown
  const teamMembers = useMemo(() => {
    // Use fetched team members if available, otherwise use our demo data
    if (teamMembersData && teamMembersData.length > 0) {
      return teamMembersData.map((member: any) => ({
        value: member.id.toString(),
        label: `${member.firstName} ${member.lastName}`
      }));
    }
    
    // Fallback team members
    return [
      { value: "david_smith", label: "David Smith" },
      { value: "jessica_jones", label: "Jessica Jones" },
      { value: "michael_johnson", label: "Michael Johnson" }
    ];
  }, [teamMembersData]);
  
  // Format contacts data for the dropdown with unique names only
  const contacts = useMemo(() => {
    if (contactsData && contactsData.length > 0) {
      // Create a Map to track unique names
      const uniqueContacts = new Map();
      
      // Process each contact
      contactsData.forEach(contact => {
        const fullName = `${contact.firstName} ${contact.lastName}`;
        
        // Only add if this name doesn't already exist
        if (!uniqueContacts.has(fullName)) {
          uniqueContacts.set(fullName, {
            value: contact.id.toString(),
            label: fullName
          });
        }
      });
      
      // Convert the Map values to an array
      return Array.from(uniqueContacts.values());
    }
    
    // Fallback contacts
    return [
      { value: "sarah_williams", label: "Sarah Williams" },
      { value: "james_davis", label: "James Davis" },
      { value: "emma_thompson", label: "Emma Thompson" }
    ];
  }, [contactsData]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };
  
  const handleTeamMemberChange = (value: string) => {
    setSelectedTeamMember(value);
    onTeamMemberChange(value);
  };
  
  const handleContactChange = (value: string) => {
    setSelectedContact(value);
    // Pass the contact value to the parent component if handler exists
    if (onContactChange) {
      onContactChange(value);
    }
  };
  
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (onStartDateChange) {
      onStartDateChange(date);
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (onEndDateChange) {
      onEndDateChange(date);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-grow flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
          {onToggleFilters && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={onToggleFilters}
                    className="ml-2 border-gray-300"
                    aria-label={showFilters ? "Hide Filters" : "Show Filters"}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showFilters ? "Hide Filters" : "Show Filters"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Two-column layout for filters with Status and Event Type at top - only shown if showFilters is true */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Status Dropdown */}
            <div>
              <Label htmlFor="status-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                Status
              </Label>
              <Select onValueChange={onStatusChange}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {eventStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Team Member Dropdown */}
            <div>
              <Label htmlFor="team-member-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                Team Member
              </Label>
              <SearchableCombobox
                options={teamMembers}
                placeholder="Select Team Member"
                value={selectedTeamMember}
                onChange={handleTeamMemberChange}
                emptyMessage="No team members found"
              />
            </div>
            
            {/* Start Date Picker */}
            <div>
              <Label htmlFor="start-date-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                Start Date
              </Label>
              <DatePicker
                date={startDate}
                setDate={handleStartDateChange}
                placeholder="Select start date"
              />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            {/* Event Type Dropdown */}
            <div>
              <Label htmlFor="event-type-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                Event Type
              </Label>
              <Select onValueChange={onEventTypeChange}>
                <SelectTrigger id="event-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Contacts Dropdown */}
            <div>
              <Label htmlFor="contact-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                Contacts
              </Label>
              <SearchableCombobox
                options={contacts}
                placeholder="Select Contact"
                value={selectedContact}
                onChange={handleContactChange}
                emptyMessage="No contacts found"
              />
            </div>
            
            {/* End Date Picker */}
            <div>
              <Label htmlFor="end-date-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                End Date
              </Label>
              <DatePicker
                date={endDate}
                setDate={handleEndDateChange}
                placeholder="Select end date"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Filter UI hidden until filters are available 
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="status-filter" className="block text-sm font-medium text-neutral-700 mb-1">Status</Label>
                <Select onValueChange={onStatusChange}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {eventStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="event-type-filter" className="block text-sm font-medium text-neutral-700 mb-1">Event Type</Label>
                <Select onValueChange={onEventTypeChange}>
                  <SelectTrigger id="event-type-filter">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      */}
    </div>
  );
}
