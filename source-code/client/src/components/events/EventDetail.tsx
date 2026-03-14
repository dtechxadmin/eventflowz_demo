import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { 
  formatDate, 
  formatFullDate, 
  formatTime, 
  formatCurrency, 
  getServiceTypeLabel, 
  getEventTypeLabel,
  serviceTypes,
  eventTypes,
  musicPreferences
} from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import MilestoneProgress from "./MilestoneProgress";
import ContactCard from "@/components/contacts/ContactCard";
import AddVendorModal from "@/components/contacts/AddVendorModal";
import AddClientModal from "@/components/contacts/AddClientModal";
import { ArrowLeft, ChevronDown, Plus, Music } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Event, Contact, EventContact } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EventDetail() {
  const { id } = useParams();
  const eventId = parseInt(id as string);
  
  const { data: event, isLoading: isEventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !isNaN(eventId),
  });
  
  const { data: eventContacts, isLoading: isContactsLoading } = useQuery<EventContact[]>({
    queryKey: [`/api/events/${eventId}/contacts`],
    enabled: !isNaN(eventId),
  });
  
  // Add local state for date which can be updated by the form
  const [eventDate, setEventDate] = useState<Date | null>(null);
  
  // Add state for custom music genres
  const [customGenres, setCustomGenres] = useState<Array<{value: string, label: string}>>([]);
  const [newGenreName, setNewGenreName] = useState('');
  const [isAddGenreOpen, setIsAddGenreOpen] = useState(false);
  
  // Add state for Add Vendor modal
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  
  // Add state for Add Client modal
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  
  // Add state for alert dialog
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    type: 'service' | 'addon';
    id: string;
    checked: boolean;
  } | null>(null);
  
  // Define a custom type for our form data that includes tracking fields
  type EventFormData = Partial<Event> & {
    dateChanged?: boolean;
  };
  
  // Add state for form changes tracking
  const [formChanged, setFormChanged] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData>({});
  
  // Function to handle input changes and track form state
  const handleInputChange = (field: string, value: string | number) => {
    setEventFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setFormChanged(true);
  };
  
  // Separate handler for date field to avoid type errors
  const handleDateChange = (newDate: Date) => {
    setEventFormData(prev => {
      return {
        ...prev,
        dateChanged: true
      } as EventFormData;
    });
    setFormChanged(true);
  };
  
  // Function to save form changes
  const saveFormChanges = async () => {
    try {
      if (Object.keys(eventFormData).length > 0 || eventDate) {
        // Prepare data for submission
        const dataToSubmit: Record<string, any> = {...eventFormData};
        
        // Log the data being submitted for debugging
        console.log("Form data before submission:", eventFormData);
        
        // Remove custom fields we added for tracking
        if ('dateChanged' in dataToSubmit) {
          delete dataToSubmit.dateChanged;
        }
        
        // If date was updated, add it to the submission
        if (eventDate && ('dateChanged' in eventFormData)) {
          dataToSubmit.date = eventDate.toISOString();
        }
        
        console.log("Data being submitted to server:", dataToSubmit);
        
        const result = await updateEventMutation.mutateAsync(dataToSubmit);
        console.log("Server response:", result);
        
        setFormChanged(false);
        setEventFormData({});
        toast({
          title: "Changes saved",
          description: "Event details have been updated successfully",
        });
      } else {
        console.log("No changes to save");
        toast({
          title: "No changes detected",
          description: "No changes were made to save",
        });
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error saving changes",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Function to cancel form changes
  const cancelFormChanges = () => {
    setFormChanged(false);
    setEventFormData({});
    
    // Reset date if it was changed
    if (event) {
      setEventDate(new Date(event.date));
    }
    
    toast({
      title: "Changes discarded",
      description: "Your changes have been discarded",
    });
  };
  
  const { toast } = useToast();
  
  // Add mutation for updating event
  const updateEventMutation = useMutation({
    mutationFn: async (data: Partial<Event>) => {
      const res = await apiRequest("PATCH", `/api/events/${eventId}`, data);
      return await res.json();
    },
    onSuccess: (updatedEvent) => {
      // Don't show extra toast here since we handle it in handleConfirmChange
      console.log("Event updated successfully:", updatedEvent);
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving changes",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Initialize local state when event data loads
  useEffect(() => {
    if (event?.date) {
      // Create a date object with noon time to avoid timezone issues
      const dateStr = new Date(event.date).toISOString().split('T')[0] + 'T12:00:00';
      setEventDate(new Date(dateStr));
    }
  }, [event]);
  
  // Function to add a new custom genre
  const addCustomGenre = () => {
    if (newGenreName.trim() === '') return;
    
    const newGenreValue = newGenreName.toLowerCase().replace(/\s+/g, '_');
    setCustomGenres(prev => [...prev, {
      value: newGenreValue,
      label: newGenreName.trim()
    }]);
    
    setNewGenreName('');
    setIsAddGenreOpen(false);
  };
  
  // Handle checkbox change and show confirmation dialog
  const handleCheckboxChange = (type: 'service' | 'addon', id: string, checked: boolean) => {
    setPendingChange({
      type,
      id,
      checked
    });
    setIsAlertOpen(true);
  };
  
  // Handle confirmation of the checkbox change
  const handleConfirmChange = async () => {
    if (!pendingChange || !event) return;
    
    try {
      if (pendingChange.type === 'service') {
        // Get current services as an array
        const currentServices = event.services ? event.services.split(',').map(s => s.trim()).filter(Boolean) : [];
        let updatedServices = [...currentServices];
        
        // Update services based on checkbox state
        if (pendingChange.checked) {
          // Add the service if it's not already included
          if (!currentServices.includes(pendingChange.id)) {
            updatedServices.push(pendingChange.id);
          }
          
          // Toast notification for successful service selection
          toast({
            title: "Service Added",
            description: `${getServiceTypeLabel(pendingChange.id)} has been added to this event.`,
          });
        } else {
          // Remove the service if it exists
          updatedServices = currentServices.filter(s => s !== pendingChange.id);
          
          // Toast notification for service removal
          toast({
            title: "Service Removed",
            description: `${getServiceTypeLabel(pendingChange.id)} has been removed from this event.`,
          });
        }
        
        // Join array into comma-separated string
        const serviceValue = updatedServices.join(', ');
        
        // Save the changes to the server first
        const serverResponse = await updateEventMutation.mutateAsync({ services: serviceValue });
        
        // Clear all cached data and force immediate refetch
        queryClient.removeQueries({ queryKey: [`/api/events/${eventId}`] });
        queryClient.removeQueries({ queryKey: ['/api/events'] });
        
        // Immediately refetch the updated data
        await queryClient.refetchQueries({ queryKey: [`/api/events/${eventId}`] });
        await queryClient.refetchQueries({ queryKey: ['/api/events'] });
      } else {
        // For add-ons, we'll need to add this functionality to the schema and backend
        // For now, just show a toast message
        toast({
          title: "Feature Coming Soon",
          description: "Saving production add-ons will be available in a future update.",
        });
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error Updating Service",
        description: "There was an error updating the service selection.",
        variant: "destructive",
      });
      
      // If there's an error, clear cache and refetch to ensure UI sync
      queryClient.removeQueries({ queryKey: [`/api/events/${eventId}`] });
      await queryClient.refetchQueries({ queryKey: [`/api/events/${eventId}`] });
    }
    
    // Clear the pending change and close the dialog
    setPendingChange(null);
    setIsAlertOpen(false);
  };
  
  // Handle cancellation of the checkbox change
  const handleCancelChange = () => {
    setPendingChange(null);
    setIsAlertOpen(false);
  };
  
  if (isEventLoading) {
    return (
      <div className="pb-6 max-w-6xl mx-auto">
        <div className="flex flex-col mb-5">
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-12 w-full mb-4" />
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
          <Skeleton className="h-12 w-full" />
          <div className="p-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">Event Not Found</h2>
        <p className="text-neutral-600 mb-4">The event you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link href="/events">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="pb-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col mb-5">
        <div className="flex-1">
          <div className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded mb-2">
            {getEventTypeLabel(event.eventType).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold mb-1">{event.name}</h1>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-sm">
            {event.services ? 
              `${event.services.split(',').map(service => getServiceTypeLabel(service.trim())).join(', ')} - ` 
              : ''
            }{eventDate ? formatFullDate(eventDate) : formatFullDate(event.date)}
          </p>
          <p className="text-gray-600 text-sm">
            {event.venue}
          </p>
        </div>
      </div>

      {/* Milestone Progress - contained within a div with no z-index */}
      <div className="relative">
        <MilestoneProgress currentStatus={event.status} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
        <TabsList className="border-b border-gray-200 w-full rounded-none justify-start px-2">
          <TabsTrigger value="details" className="py-2 px-6 text-sm font-medium">Details</TabsTrigger>
          <TabsTrigger value="notes" className="py-2 px-6 text-sm font-medium">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left column (75% width) - Event details */}
            <div className="md:w-3/4">
              <Accordion 
                type="multiple"
                defaultValue={["event", event.status === 'pcm' || event.status === '2cm' ? "payments" : null].filter(Boolean) as string[]}
                className="mb-4"
              >
                <AccordionItem value="event" className="border border-gray-200 rounded-md overflow-hidden">
                  <AccordionTrigger className="bg-green-600 text-white hover:no-underline hover:bg-green-700 px-4 py-2">
                    <span className="text-base font-medium">Event</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-2 relative">
                    {/* Floating Save/Cancel Buttons */}
                    {formChanged && (
                      <div className="fixed bottom-4 right-4 flex gap-2 z-50">
                        <Button
                          variant="outline"
                          onClick={cancelFormChanges}
                          className="bg-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveFormChanges}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 block mb-1">Event Name</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded p-2 text-sm" 
                            defaultValue={event.name} 
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 block mb-1">Event Date</label>
                          <input 
                            type="date" 
                            className="w-full border border-gray-300 rounded p-2 text-sm" 
                            value={eventDate ? eventDate.toISOString().split('T')[0] : (event.date ? new Date(event.date).toISOString().split('T')[0] : '')}
                            onChange={(e) => {
                              // Update the event date state when the date input changes
                              if (e.target.value) {
                                // Create date at noon to avoid timezone issues
                                const selectedDate = new Date(e.target.value + 'T12:00:00');
                                setEventDate(selectedDate);
                                handleDateChange(selectedDate);
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 block mb-1">Event Type</label>
                          <select 
                            className="w-full border border-gray-300 rounded p-2 text-sm" 
                            defaultValue={event.eventType}
                            onChange={(e) => handleInputChange('eventType', e.target.value)}
                          >
                            {eventTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 block mb-1">Guest Count</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded p-2 text-sm" 
                            defaultValue={event.guestCount}
                            onChange={(e) => {
                              // Ensure only numbers are entered
                              const value = e.target.value.replace(/\D/g, '');
                              e.target.value = value;
                              handleInputChange('guestCount', parseInt(value) || 0);
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 block mb-1">Min Budget</label>
                          <div className="relative">
                            <span className="absolute left-2 top-2 text-gray-500">$</span>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded p-2 pl-6 text-sm" 
                              defaultValue={event.minBudget}
                              onChange={(e) => {
                                // Ensure only numbers are entered
                                const value = e.target.value.replace(/\D/g, '');
                                e.target.value = value;
                                handleInputChange('minBudget', parseInt(value) || 0);
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 block mb-1">Max Budget</label>
                          <div className="relative">
                            <span className="absolute left-2 top-2 text-gray-500">$</span>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded p-2 pl-6 text-sm" 
                              defaultValue={event.maxBudget}
                              onChange={(e) => {
                                // Ensure only numbers are entered
                                const value = e.target.value.replace(/\D/g, '');
                                e.target.value = value;
                                handleInputChange('maxBudget', parseInt(value) || 0);
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Venue</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 rounded p-2 text-sm" 
                          defaultValue={event.venue}
                          onChange={(e) => handleInputChange('venue', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Services Column */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h4 className="text-md font-semibold mb-2">Services</h4>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input 
                                type="checkbox"
                                id="service-dj_mc"
                                checked={event.services ? event.services.split(',').map(s => s.trim()).includes("dj_mc") : false}
                                className="mr-2"
                                onChange={(e) => handleCheckboxChange('service', 'dj_mc', e.target.checked)}
                              />
                              <label htmlFor="service-dj_mc" className="text-sm cursor-pointer">
                                DJ + MC
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="checkbox"
                                id="service-live_music"
                                checked={event.services ? event.services.split(',').map(s => s.trim()).includes("live_music") : false}
                                className="mr-2"
                                onChange={(e) => {
                                  console.log("Live Music checkbox changed:", e.target.checked, "Current services:", event.services);
                                  handleCheckboxChange('service', 'live_music', e.target.checked);
                                }}
                              />
                              <label htmlFor="service-live_music" className="text-sm cursor-pointer">
                                L!VE Music
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="checkbox"
                                id="service-djf"
                                checked={event.services ? event.services.split(',').map(s => s.trim()).includes("djf") : false}
                                className="mr-2"
                                onChange={(e) => handleCheckboxChange('service', 'djf', e.target.checked)}
                              />
                              <label htmlFor="service-djf" className="text-sm cursor-pointer">
                                DJF
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="checkbox"
                                id="service-av"
                                checked={event.services ? event.services.split(',').map(s => s.trim()).includes("av") : false}
                                className="mr-2"
                                onChange={(e) => {
                                  console.log("AV checkbox changed:", e.target.checked, "Current services:", event.services);
                                  handleCheckboxChange('service', 'av', e.target.checked);
                                }}
                              />
                              <label htmlFor="service-av" className="text-sm cursor-pointer">
                                AV + Sound
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Production Add-Ons Column */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h4 className="text-md font-semibold mb-2">Production Add-Ons</h4>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input 
                                type="checkbox"
                                id="addon-av_sound"
                                className="mr-2"
                                onChange={(e) => handleCheckboxChange('addon', 'av_sound', e.target.checked)}
                              />
                              <label htmlFor="addon-av_sound" className="text-sm cursor-pointer">
                                AV + Sound
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="checkbox"
                                id="addon-photobooth"
                                className="mr-2"
                                onChange={(e) => handleCheckboxChange('addon', 'photobooth', e.target.checked)}
                              />
                              <label htmlFor="addon-photobooth" className="text-sm cursor-pointer">
                                Photobooth
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="checkbox"
                                id="addon-uplights"
                                className="mr-2"
                                onChange={(e) => handleCheckboxChange('addon', 'uplights', e.target.checked)}
                              />
                              <label htmlFor="addon-uplights" className="text-sm cursor-pointer">
                                Uplights
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Music Preferences Section */}
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h4 className="text-md font-semibold mb-2">Music Preferences</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {musicPreferences.concat(customGenres).map((genre) => (
                            <div key={genre.value} className="flex items-center">
                              <input 
                                type="checkbox"
                                id={`genre-${genre.value}`}
                                className="mr-2"
                              />
                              <label htmlFor={`genre-${genre.value}`} className="text-sm cursor-pointer">
                                {genre.label}
                              </label>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Dialog open={isAddGenreOpen} onOpenChange={setIsAddGenreOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Plus className="h-3 w-3 mr-2" />
                                Add Custom Genre
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Custom Music Genre</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <Input 
                                  placeholder="Genre name" 
                                  value={newGenreName} 
                                  onChange={(e) => setNewGenreName(e.target.value)} 
                                />
                              </div>
                              <DialogFooter>
                                <Button onClick={addCustomGenre}>Add Genre</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      
                      {/* Additional Details Section */}
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h4 className="text-md font-semibold mb-2">Additional Details</h4>
                        <textarea 
                          className="w-full border border-gray-300 rounded p-2 text-sm min-h-[100px]"
                          onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                          defaultValue={event.additionalDetails || ''}
                        ></textarea>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              
                <AccordionItem 
                  value="payments" 
                  className="border border-gray-200 rounded-md overflow-hidden mt-4"
                >
                  <AccordionTrigger className="bg-green-600 text-white hover:no-underline hover:bg-green-700 px-4 py-2">
                    <span className="text-base font-medium">Payments</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-2">
                    {/* Show payments table for PCM and 2CM statuses */}
                    {event.status === 'pcm' || event.status === '2cm' ? (
                      <div className="overflow-x-auto">
                        {/* Calculate total amount based on the event's max budget */}
                        {(() => {
                          // Use average of min and max budget
                          const totalAmount = (event.minBudget + event.maxBudget) / 2;
                          // Calculate each payment (50% split)
                          const firstPayment = totalAmount * 0.5;
                          const secondPayment = totalAmount * 0.5;
                          
                          // Generate consistent invoice numbers
                          const eventYear = new Date(event.date).getFullYear().toString().slice(-2);
                          const invoiceBase = parseInt(eventYear + event.id.toString().padStart(3, '0'));
                          const firstInvoiceNum = `#IN${invoiceBase}-1`;
                          const secondInvoiceNum = `#IN${invoiceBase}-2`;
                          
                          return (
                            <>
                              <div className="mb-2 px-6 py-2 bg-gray-50 rounded text-sm">
                                <strong>Total Contract Amount:</strong> {formatCurrency(totalAmount)}
                              </div>
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Invoice #
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Amount
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      {/* Empty header for action column */}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {/* First Payment Row - 50% of budget */}
                                  <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {firstInvoiceNum}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatCurrency(firstPayment)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {/* Date 6 months before event date */}
                                      {formatDate(new Date(new Date(event.date).setMonth(new Date(event.date).getMonth() - 6)))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Complete
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <div className="text-gray-400 cursor-not-allowed">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <circle cx="10" cy="6" r="2" />
                                          <circle cx="10" cy="10" r="2" />
                                          <circle cx="10" cy="14" r="2" />
                                        </svg>
                                      </div>
                                    </td>
                                  </tr>
                                  {/* Second Payment Row - 50% of budget */}
                                  <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {secondInvoiceNum}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatCurrency(secondPayment)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {/* Date 10 days before event date */}
                                      {formatDate(new Date(new Date(event.date).setDate(new Date(event.date).getDate() - 10)))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Upcoming
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <div className="text-gray-400 cursor-not-allowed">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <circle cx="10" cy="6" r="2" />
                                          <circle cx="10" cy="10" r="2" />
                                          <circle cx="10" cy="14" r="2" />
                                        </svg>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded p-4 text-center text-gray-500 italic">
                        No payments due for this event at this time.
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            {/* Right column (25% width) - Contacts section */}
            <div className="md:w-1/4">
              <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
                <div className="bg-green-600 text-white px-4 py-2">
                  <span className="text-base font-medium">Contacts</span>
                </div>
                <div className="p-4">
                  {/* Add New Contact Dropdown */}
                  <Select onValueChange={(value) => {
                    if (value === "vendor") {
                      setIsAddVendorModalOpen(true);
                    } else if (value === "client") {
                      setIsAddClientModalOpen(true);
                    }
                  }}>
                    <SelectTrigger className="w-full mb-4">
                      <SelectValue placeholder="Add New Contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Add Client</SelectItem>
                      <SelectItem value="team_member">Add Team Member</SelectItem>
                      <SelectItem value="vendor">Add Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Contact List */}
                  <div className="space-y-3">
                    {isContactsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : eventContacts && eventContacts.length > 0 ? (
                      eventContacts.map((contact) => {
                        // Get the first letter of first and last name for avatar
                        const initials = (contact.firstName.charAt(0) + contact.lastName.charAt(0)).toUpperCase();
                        
                        return (
                          <div key={contact.id} className="flex items-start space-x-3 p-2 border border-gray-100 rounded-md hover:bg-gray-50">
                            <div className="bg-green-100 text-green-800 h-10 w-10 rounded-full flex items-center justify-center font-medium">
                              {initials}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                              <div className="text-sm text-gray-500">{contact.role}</div>
                            </div>
                            <ContactCard contact={contact} eventId={eventId} />
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-neutral-500 text-sm italic">No contacts associated with this event.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notes" className="p-4">
          <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4">
            <p className="text-neutral-500 text-sm italic">No notes have been added to this event yet.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Alert Dialog for Confirmation */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Service Selection</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange?.type === 'service' 
                ? pendingChange.checked 
                  ? `Are you sure you want to add ${getServiceTypeLabel(pendingChange.id)} to this event? You can select multiple services that will appear comma-separated in the event header.`
                  : `Are you sure you want to remove ${getServiceTypeLabel(pendingChange.id)} from this event?`
                : `Are you sure you want to ${pendingChange?.checked ? 'add' : 'remove'} this production add-on?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChange} className="bg-green-600 hover:bg-green-700">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Add Vendor Modal */}
      <AddVendorModal 
        isOpen={isAddVendorModalOpen}
        onClose={() => setIsAddVendorModalOpen(false)}
        eventId={eventId}
      />
      
      {/* Add Client Modal */}
      <AddClientModal 
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        eventId={eventId}
      />
    </div>
  );
}