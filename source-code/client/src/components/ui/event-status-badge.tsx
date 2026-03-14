import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type EventStatusBadgeProps = {
  status: string;
  className?: string;
};

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "inquiry":
      case "follow_up":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "proposal":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "icm":
      case "pcm":
      case "2cm":
      case "fcm":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "pay_retainer":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "completed":
      case "review":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "inquiry":
        return "Inquiry";
      case "follow_up":
        return "Follow Up";
      case "icm":
        return "ICM";
      case "proposal":
        return "Proposal";
      case "pay_retainer":
        return "Pay Retainer";
      case "pcm":
        return "PCM";
      case "2cm":
        return "2CM";
      case "fcm":
        return "FCM";
      case "gdg":
        return "GDG";
      case "review":
        return "Review";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusVariant(status), className)}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
