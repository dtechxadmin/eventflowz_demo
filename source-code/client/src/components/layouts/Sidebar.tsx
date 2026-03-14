import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  UserCircle,
  Settings,
  PanelRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  mobile?: boolean;
  onNavClick?: () => void;
}

export default function Sidebar({ mobile, onNavClick }: SidebarProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const navItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
      href: "/",
      id: "dashboard",
    },
    {
      label: "Events",
      icon: <Calendar className="w-5 h-5 mr-2" />,
      href: "/events",
      id: "events",
    },
    {
      label: "Contacts",
      icon: <Users className="w-5 h-5 mr-2" />,
      notImplemented: true,
      id: "contacts",
    },
    {
      label: "Team",
      icon: <UserCircle className="w-5 h-5 mr-2" />,
      notImplemented: true,
      id: "team",
    },
    // Tasks and Invoices pages removed as requested
  ];
  
  const settingsNavItems = [
    {
      label: "General",
      icon: <Settings className="w-5 h-5 mr-2" />,
      href: "/settings",
      id: "settings",
    },
    {
      label: "Account",
      icon: <PanelRight className="w-5 h-5 mr-2" />,
      href: "/account",
      id: "account",
    },
  ];
  
  // Handler for navigation
  const handleNavigation = useCallback((item: any) => {
    if (item.notImplemented) {
      toast({
        title: "Coming in Next Release",
        description: `The ${item.label} feature will be available in the next release.`,
        variant: "default",
      });
      return;
    }
    
    if (item.href) {
      navigate(item.href);
      if (onNavClick) onNavClick();
    }
  }, [navigate, onNavClick, toast]);

  return (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-neutral-200">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => handleNavigation({ 
            href: "/", 
            label: "Dashboard", 
            id: "logo" 
          })}
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="ml-2 font-semibold text-lg">EventFlowz</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-2">
        <ul>
          <li className="px-2 py-1 text-neutral-500 font-medium text-sm">
            Main
          </li>
          {navItems.map((item) => (
            <li key={item.id}>
              <div 
                className={cn(
                  "flex items-center px-4 py-2 rounded-md mx-2 cursor-pointer",
                  item.notImplemented 
                    ? "text-neutral-400 text-sm"
                    : location === item.href 
                      ? "text-green-600 font-bold text-base border-l-4 border-green-500 pl-3" 
                      : "text-neutral-600 hover:bg-neutral-100 text-sm"
                )}
                onClick={() => handleNavigation(item)}
              >
                <div className={cn(
                  "flex items-center",
                  location === item.href ? "gap-3" : "gap-2"
                )}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.notImplemented && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded-md whitespace-nowrap">
                    Next Release
                  </span>
                )}
              </div>
            </li>
          ))}
          
          <li className="mt-4 px-2 py-1 text-neutral-500 font-medium text-sm">
            Settings
          </li>
          {settingsNavItems.map((item) => (
            <li key={item.id}>
              <div 
                className={cn(
                  "flex items-center px-4 py-2 rounded-md mx-2 cursor-pointer",
                  location === item.href 
                    ? "text-green-600 font-bold text-base border-l-4 border-green-500 pl-3" 
                    : "text-neutral-600 hover:bg-neutral-100 text-sm"
                )}
                onClick={() => handleNavigation(item)}
              >
                <div className={cn(
                  "flex items-center",
                  location === item.href ? "gap-3" : "gap-2"
                )}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
