import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertEventContact } from "@shared/schema";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
}

export default function AddClientModal({ isOpen, onClose, eventId }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    accountableForPayment: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if all required fields are filled
  const isFormValid = formData.firstName.trim() && 
                     formData.lastName.trim() && 
                     formData.email.trim() && 
                     formData.phone.trim() && 
                     formData.accountableForPayment.trim();

  const addClientMutation = useMutation({
    mutationFn: async (clientData: InsertEventContact) => {
      const response = await apiRequest("POST", `/api/events/${eventId}/contacts`, clientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "contacts"] });
      toast({
        title: "Client added",
        description: "Client has been successfully added to this event.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add client",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const clientData: InsertEventContact = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      role: formData.accountableForPayment,
      eventId,
      contactType: "client",
      company: null,
      website: null
    };
    addClientMutation.mutate(clientData);
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      accountableForPayment: ""
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Icon */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Client</h2>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder=""
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder=""
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder=""
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder=""
              />
            </div>
          </div>

          {/* Accountable for Payment Field - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="accountableForPayment">Accountable for Payment</Label>
            <Select
              value={formData.accountableForPayment}
              onValueChange={(value) => handleInputChange('accountableForPayment', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="px-6"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || addClientMutation.isPending}
              className={`px-6 ${
                isFormValid && !addClientMutation.isPending
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-gray-400"
              } text-white`}
            >
              {addClientMutation.isPending ? "Adding..." : "ADD CLIENT"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}