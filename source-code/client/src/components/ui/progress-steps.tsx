import { cn } from "@/lib/utils";
import { Check, Calendar, ClipboardList, DollarSign, Flag, ClipboardCheck } from "lucide-react";

interface ProgressStepProps {
  steps: {
    id: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  currentStep: string;
  completedSteps: string[];
}

export function ProgressSteps({ steps, currentStep, completedSteps }: ProgressStepProps) {
  const getStepIcon = (step: string) => {
    switch (step) {
      case "inquiry":
        return <Check className="h-4 w-4" />;
      case "follow_up":
        return <Check className="h-4 w-4" />;
      case "icm":
        return <ClipboardList className="h-4 w-4" />;
      case "proposal":
        return <FileText className="h-4 w-4" />;
      case "pay_retainer":
        return <DollarSign className="h-4 w-4" />;
      case "pcm":
        return <Calendar className="h-4 w-4" />;
      case "2cm":
        return <ClipboardList className="h-4 w-4" />;
      case "fcm":
        return <DollarSign className="h-4 w-4" />;
      case "gdg":
        return <ClipboardCheck className="h-4 w-4" />;
      case "review":
        return <Flag className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative mb-10">
      {/* Progress Bar */}
      <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-neutral-200">
        <div 
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
          style={{ 
            width: `${(completedSteps.length / steps.length) * 100}%`,
            transition: "width 0.5s ease-in-out"
          }}
        />
      </div>
      
      {/* Milestone Steps */}
      <div className="flex justify-between">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={cn(
                  "rounded-full w-8 h-8 flex items-center justify-center",
                  isCompleted ? "bg-primary text-white" :
                  isActive ? "bg-primary-light border-4 border-primary text-primary-dark" :
                  "bg-neutral-200 text-neutral-400"
                )}
              >
                {step.icon || getStepIcon(step.id)}
              </div>
              <span className={cn(
                "text-xs mt-1",
                isActive ? "text-primary-dark font-medium" :
                isCompleted ? "text-neutral-600" : 
                "text-neutral-500"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
