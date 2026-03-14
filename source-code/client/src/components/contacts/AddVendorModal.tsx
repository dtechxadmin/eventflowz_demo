import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertEventContact } from "@shared/schema";

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
}

export default function AddVendorModal({ isOpen, onClose, eventId }: AddVendorModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    role: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if all required fields are filled
  const isFormValid = formData.firstName.trim() && 
                     formData.lastName.trim() && 
                     formData.email.trim() && 
                     formData.phone.trim() && 
                     formData.company.trim() && 
                     formData.website.trim() && 
                     formData.role.trim();

  const addVendorMutation = useMutation({
    mutationFn: async (vendorData: InsertEventContact) => {
      const response = await apiRequest("POST", `/api/events/${eventId}/contacts`, vendorData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "contacts"] });
      toast({
        title: "Vendor added",
        description: "Vendor has been successfully added to this event.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add vendor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const vendorData: InsertEventContact = {
      ...formData,
      eventId,
      contactType: "vendor"
    };
    addVendorMutation.mutate(vendorData);
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      website: "",
      role: ""
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
            <h2 className="text-xl font-semibold">Vendor</h2>
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
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder=""
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder=""
              />
            </div>
          </div>

          {/* Role Field - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              placeholder=""
            />
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
              disabled={!isFormValid || addVendorMutation.isPending}
              className={`px-6 ${
                isFormValid && !addVendorMutation.isPending
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-gray-400"
              } text-white`}
            >
              {addVendorMutation.isPending ? "Adding..." : "ADD VENDOR"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}