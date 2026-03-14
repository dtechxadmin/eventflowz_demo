import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MilestoneProgressProps {
  currentStatus: string;
}

export default function MilestoneProgress({ currentStatus }: MilestoneProgressProps) {
  const milestones = [
    { id: "inquiry", label: "Inquiry" },
    { id: "follow_up", label: "Follow Up" },
    { id: "icm", label: "ICM" },
    { id: "proposal", label: "Proposal" },
    { id: "pay_retainer", label: "Pay Retainer" },
    { id: "pcm", label: "PCM" },
    { id: "2cm", label: "2CM" },
    { id: "fcm", label: "FCM" },
    { id: "gdg", label: "GDG" },
    { id: "review", label: "Review" }
  ];
  
  // Find the current active stage
  const initialIndex = milestones.findIndex(m => m.id === currentStatus);
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 5); // default to PCM if not found
  
  const handlePreviousStatus = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };
  
  const handleNextStatus = () => {
    if (activeIndex < milestones.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handlePreviousStatus}
          disabled={activeIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Status
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
          onClick={handleNextStatus}
          disabled={activeIndex === milestones.length - 1}
        >
          Next Status
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative mt-6 mb-8">
        {/* Progress bar line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
        
        {/* Milestone Steps */}
        <div className="flex justify-between relative">
          {milestones.map((milestone, index) => {
            const isCompleted = index < activeIndex;
            const isActive = index === activeIndex;
            const isLast = index === milestones.length - 1;
            
            return (
              <div key={milestone.id} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "rounded-full w-8 h-8 flex items-center justify-center border",
                    isCompleted || isActive ? "bg-green-500 border-green-500 text-white" :
                    "bg-white border-gray-300 text-gray-300"
                  )}
                >
                  {isCompleted && !isLast && <Check className="h-4 w-4" />}
                </div>
                <span className={cn(
                  "text-xs mt-2 text-center",
                  isCompleted ? "text-green-600 font-medium" : 
                  isActive ? "text-green-600 font-medium" : 
                  "text-gray-400"
                )}>
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
