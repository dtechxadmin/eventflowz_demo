import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/ui/event-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getEventTypeLabel, getServiceTypeLabel } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

interface EventsTableProps {
  searchQuery: string;
  statusFilter?: string;
  eventTypeFilter?: string;
  teamMemberFilter?: string;
  contactFilter?: string;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  startDate?: Date;
  endDate?: Date;
  viewMode: "all" | "leads" | "events";
  leadStatuses: string[];
}

export default function EventsTable({ 
  searchQuery,
  statusFilter,
  eventTypeFilter,
  teamMemberFilter,
  contactFilter,
  dateRange,
  startDate,
  endDate,
  viewMode,
  leadStatuses
}: EventsTableProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const perPage = 5;
  
  const { data: events = [], isLoading: isLoadingEvents, error: eventsError } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });
  
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
  });
  
  // Map to store contacts per event
  const [eventContactsMap, setEventContactsMap] = useState<Record<number, any[]>>({});
  
  // This will fetch contacts for each event one by one
  // In a real-world scenario, this would be optimized with a batch endpoint
  useEffect(() => {
    if (!events.length) return;

    const fetchContactsForEvents = async () => {
      const contactsMap: Record<number, any[]> = {};
      
      // Only fetch for events that have been loaded
      for (const event of events) {
        try {
          const response = await fetch(`/api/events/${event.id}/contacts`);
          if (response.ok) {
            const eventContacts = await response.json();
            contactsMap[event.id] = eventContacts;
          } else {
            contactsMap[event.id] = [];
          }
        } catch (error) {
          console.error(`Error fetching contacts for event ${event.id}:`, error);
          contactsMap[event.id] = [];
        }
      }
      
      setEventContactsMap(contactsMap);
    };
    
    fetchContactsForEvents();
  }, [events.length]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const filteredEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) return [];
    
    let filtered = [...events];
    
    // For team members, only show events where Sarah Johnson is assigned
    if (user?.role === "team_member") {
      filtered = filtered.filter(event => {
        const eventContacts = eventContactsMap[event.id] || [];
        return eventContacts.some(contact => 
          contact.firstName === "Sarah" && 
          contact.lastName === "Johnson" && 
          contact.contactType === "team_member"
        );
      });
    } else {
      // Apply view mode filter (Leads or Events) only for non-team members
      if (viewMode === "leads") {
        filtered = filtered.filter(event => leadStatuses.includes(event.status));
      } else if (viewMode === "events") {
        filtered = filtered.filter(event => !leadStatuses.includes(event.status));
      }
    }
    
    // Apply search filter - global search across event name, venue, and contacts
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      // Filter by event properties and associated contacts
      filtered = filtered.filter(event => {
        // Check event name and venue
        if (
          event.name.toLowerCase().includes(query) || 
          event.venue.toLowerCase().includes(query)
        ) {
          return true;
        }
        
        // Check contacts associated with this event
        const eventContacts = eventContactsMap[event.id] || [];
        if (eventContacts.length > 0) {
          // Check if any contact associated with this event matches the search
          const hasMatchingContact = eventContacts.some(contact => {
            const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
            return fullName.includes(query);
          });
          
          if (hasMatchingContact) {
            return true;
          }
        }
        
        // Also check general contacts as a fallback
        // This is useful when the event-contact relationships are not fully loaded yet
        if (contacts && Array.isArray(contacts)) {
          const matchingContact = contacts.find(contact => {
            const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
            return fullName.includes(query);
          });
          
          if (matchingContact) {
            return true;
          }
        }
        
        return false;
      });
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(event => event.status === statusFilter);
    }
    
    // Apply event type filter
    if (eventTypeFilter && eventTypeFilter !== "all") {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter);
    }
    
    // Apply team member filter
    if (teamMemberFilter && teamMemberFilter !== "all") {
      filtered = filtered.filter(event => {
        // Check if this event has the selected team member assigned
        return event.teamMembers && event.teamMembers.includes(teamMemberFilter);
      });
    }
    
    // Apply contact filter
    if (contactFilter && contactFilter !== "all") {
      filtered = filtered.filter(event => {
        // Get contacts for this event
        const eventContacts = eventContactsMap[event.id] || [];
        // Check if the selected contact is associated with this event
        return eventContacts.some(contact => contact.id.toString() === contactFilter);
      });
    }
    
    // Apply date range filter
    if (dateRange && (dateRange.from || dateRange.to)) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        
        if (dateRange.from && dateRange.to) {
          return eventDate >= dateRange.from && eventDate <= dateRange.to;
        } 
        
        if (dateRange.from) {
          return eventDate >= dateRange.from;
        }
        
        if (dateRange.to) {
          return eventDate <= dateRange.to;
        }
        
        return true;
      });
    }
    
    // Apply start date filter
    if (startDate) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        // Start of day
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        return eventDate >= startOfDay;
      });
    }
    
    // Apply end date filter
    if (endDate) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        // End of day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        return eventDate <= endOfDay;
      });
    }
    
    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        if (sortField === "date") {
          return sortDirection === "asc" 
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        
        const aValue = a[sortField as keyof typeof a] || "";
        const bValue = b[sortField as keyof typeof b] || "";
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
    }
    
    return filtered;
  }, [events, searchQuery, statusFilter, eventTypeFilter, teamMemberFilter, contactFilter, dateRange, startDate, endDate, sortField, sortDirection, eventContactsMap, viewMode, leadStatuses]);
  
  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / perPage);
  const paginatedEvents = filteredEvents.slice((page - 1) * perPage, page * perPage);
  
  // Show loading state if either events or contacts are loading
  if (isLoadingEvents || isLoadingContacts) {
    return <EventsTableSkeleton />;
  }
  
  // Show error message if there's an error loading events
  if (eventsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading events. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div className="flex items-center">
                  Event Name
                  <Button variant="ghost" size="sm" onClick={() => handleSort("name")}>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Date
                  <Button variant="ghost" size="sm" onClick={() => handleSort("date")}>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((event) => (
                <TableRow 
                  key={event.id} 
                  className="event-row" 
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <TableCell>
                    <div className="font-medium">{event.name.replace('dj_mc', '').trim()}</div>
                  </TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>
                    {/* Remove address from venue, just show venue name */}
                    {event.venue.split(',')[0]}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {getEventTypeLabel(event.eventType)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {event.services ? 
                        event.services.split(',').map((service: string) => getServiceTypeLabel(service.trim())).join(', ')
                        : '-'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* Show only up to 2 contacts */}
                    <div className="flex -space-x-2">
                      {eventContactsMap[event.id]?.slice(0, 2).map((contact) => (
                        <Avatar key={contact.id} className="h-8 w-8 border-2 border-white">
                          <AvatarFallback className="bg-neutral-300 text-xs">
                            {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )) || []}
                    </div>
                  </TableCell>
                  <TableCell>
                    <EventStatusBadge status={event.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-neutral-500">No events found. Try adjusting your filters.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
          <div>
            <p className="text-sm text-neutral-700">
              Showing <span className="font-medium">{((page - 1) * perPage) + 1}</span> to{" "}
              <span className="font-medium">{Math.min(page * perPage, filteredEvents.length)}</span> of{" "}
              <span className="font-medium">{filteredEvents.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                variant="outline"
                size="icon"
                className="rounded-l-md"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="icon"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {totalPages > 5 && (
                <Button variant="outline" disabled>
                  ...
                </Button>
              )}
              
              <Button
                variant="outline"
                size="icon"
                className="rounded-r-md"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      )}
    </Card>
  );
}

function EventsTableSkeleton() {
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Event Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-8 w-8 rounded-full" />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}