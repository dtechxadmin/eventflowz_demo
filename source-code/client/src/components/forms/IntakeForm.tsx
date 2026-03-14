import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import ClientInfoForm from "./ClientInfoForm";
import EventDetailsForm from "./EventDetailsForm";
import PreferencesForm from "./PreferencesForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Steps definition
const STEPS = [
  { id: "client-info", label: "Client Information" },
  { id: "event-details", label: "Event Details" },
  { id: "preferences", label: "Preferences" }
];

// Combined form schema
const intakeFormSchema = z.object({
  // Client Info
  serviceType: z.string().min(1, "Service type is required"),
  eventType: z.string().min(1, "Event type is required"),
  minBudget: z.number().min(1000, "Minimum budget must be at least $1,000"),
  maxBudget: z.number().min(1000, "Maximum budget must be at least $1,000"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  partnerFirstName: z.string().optional(),
  partnerLastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  
  // Event Details
  eventDate: z.string().min(1, "Event date is required"),
  guestCount: z.number().min(1, "Guest count is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  venue: z.string().min(1, "Venue is required"),
  additionalDetails: z.string().optional(),
  referralSource: z.string().optional(),
  
  // Preferences
  musicPreferences: z.array(z.string()).optional(),
  specialSongs: z.string().optional(),
  equipment: z.array(z.string()).optional(),
});

type IntakeFormValues = z.infer<typeof intakeFormSchema>;

export default function IntakeForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/contacts", data);
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating contact",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/events", data);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the events query to refresh the events list
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const methods = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      serviceType: "",
      eventType: "",
      minBudget: 2500,
      maxBudget: 10000,
      firstName: "",
      lastName: "",
      partnerFirstName: "",
      partnerLastName: "",
      email: "",
      phone: "",
      
      eventDate: "",
      guestCount: 100,
      startTime: "",
      endTime: "",
      venue: "",
      additionalDetails: "",
      referralSource: "",
      
      musicPreferences: [],
      specialSongs: "",
      equipment: [],
    },
    mode: "onChange",
  });
  
  const { handleSubmit, trigger } = methods;
  
  const nextStep = async () => {
    // Validate fields for current step
    let fieldsToValidate: (keyof IntakeFormValues)[] = [];
    
    switch (currentStep) {
      case 0:
        fieldsToValidate = ['serviceType', 'eventType', 'minBudget', 'maxBudget', 'firstName', 'lastName', 'email'];
        break;
      case 1:
        fieldsToValidate = ['eventDate', 'guestCount', 'startTime', 'endTime', 'venue'];
        break;
    }
    
    const isValid = await trigger(fieldsToValidate as any);
    
    if (isValid) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const onSubmit = async (data: IntakeFormValues) => {
    console.log("Form submitted:", data);
    
    // Validate all required fields before submitting, regardless of which step we're on
    // This ensures that even if a user jumps straight to the last step, all validation happens
    const allRequiredFields: (keyof IntakeFormValues)[] = [
      'serviceType', 'eventType', 'minBudget', 'maxBudget', 
      'firstName', 'lastName', 'email',
      'eventDate', 'guestCount', 'startTime', 'endTime', 'venue'
    ];
    
    const isFormValid = await trigger(allRequiredFields as any);
    
    if (!isFormValid) {
      // If the form isn't valid, show an error message and go back to the first step
      toast({
        title: "Form Validation Error",
        description: "Please complete all required fields in the previous steps first.",
        variant: "destructive",
      });
      
      setCurrentStep(0);
      return;
    }
    
    try {
      // 1. Create the contact
      const contactData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        type: 'client'
      };
      
      const contact = await createContactMutation.mutateAsync(contactData);
      
      // 2. Create proper JavaScript Date objects for the timestamp fields
      const eventDate = new Date(data.eventDate);
      
      // Parse the time strings into hours and minutes and create full date objects
      const [startHour, startMinute] = data.startTime.split(':').map(Number);
      const [endHour, endMinute] = data.endTime.split(':').map(Number);
      
      const startTime = new Date(eventDate);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(eventDate);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      // 3. Create the event with proper naming and properly formatted dates
      let eventName = `${data.firstName} ${data.lastName} ${data.eventType}`;
      
      // If it's a wedding and partner's name is provided, format as "FirstName","","+","PartnerFirstName"
      if (data.eventType === 'wedding' && data.partnerFirstName) {
        eventName = `${data.firstName}","","+","${data.partnerFirstName}`;
      }
      
      const eventData = {
        name: eventName,
        date: eventDate.toISOString(),
        venue: data.venue,
        eventType: data.eventType,
        services: data.serviceType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        guestCount: data.guestCount,
        minBudget: data.minBudget,
        maxBudget: data.maxBudget,
        status: 'inquiry',
        referralSource: data.referralSource || '',
        additionalDetails: data.additionalDetails || '',
        musicPreferences: data.musicPreferences?.join(', ') || '',
      };
      
      const event = await createEventMutation.mutateAsync(eventData);
      
      // 4. Show success message
      toast({
        title: "Form Submitted Successfully",
        description: "A team member will contact you shortly to discuss your event.",
      });
      
      // 5. Redirect to events page
      navigate('/events');
    } catch (error: any) {
      console.error("Error submitting form:", error);
      
      // Check if it's a validation error from the API
      const errorMessage = error.message || "There was a problem submitting your form. Please try again.";
      
      toast({
        title: "Error Submitting Form",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If there's a 400 error, it's likely a validation issue, scroll to the top to see the message
      if (error.status === 400) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };
  
  const stepProgress = (currentStep / (STEPS.length - 1)) * 100;
  
  return (
    <FormProvider {...methods}>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center w-1/3">
              <div className={`rounded-full w-10 h-10 flex items-center justify-center font-medium
                ${index < currentStep ? 'bg-primary text-white' : 
                  index === currentStep ? 'bg-primary text-white' : 
                  'bg-neutral-200 text-neutral-500'}`}
              >
                {index + 1}
              </div>
              <span className={`text-xs mt-1 
                ${index === currentStep ? 'text-primary font-medium' : 
                  index < currentStep ? 'text-neutral-600' : 
                  'text-neutral-500'}`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
        
        <div className="relative mt-4">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-neutral-200">
            <div 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-300"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Form Steps */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 0 && <ClientInfoForm />}
            {currentStep === 1 && <EventDetailsForm />}
            {currentStep === 2 && <PreferencesForm />}
            
            <div className="flex justify-between mt-8">
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div></div> // Empty div for spacing
              )}
              
              {currentStep < STEPS.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createContactMutation.isPending || createEventMutation.isPending}
                >
                  {(createContactMutation.isPending || createEventMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
