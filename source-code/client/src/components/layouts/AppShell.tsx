import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface AppShellProps {
  children: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
}

export default function AppShell({ children, title, actions }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account."
        });
        // Force navigation to the auth page
        window.location.href = "/auth";
      },
      onError: () => {
        toast({
          title: "Logout failed",
          description: "There was a problem logging out. Please try again.",
          variant: "destructive"
        });
        // Even on error, try to redirect to auth
        setTimeout(() => navigate("/auth"), 1500);
      }
    });
  };
  
  // Use actual user data
  const displayName = user?.fullName || "User";
  const role = user?.role === "admin" ? "Admin" : "User";
  
  // Generate initials from the full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const initials = user?.fullName ? getInitials(user.fullName) : "U";
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="bg-white w-64 border-r border-neutral-200 flex-shrink-0 hidden md:flex flex-col">
        <Sidebar />
      </aside>
      
      {/* Mobile Sidebar with Trigger */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar mobile onNavClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white border-b border-neutral-200 py-4 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-4" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-2xl font-semibold flex items-center">{title}</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
            </Button>
            
            <div className="hidden md:flex items-center space-x-2">
              <Avatar>
                <AvatarFallback className="bg-primary text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{displayName}</div>
                <div className="text-xs text-neutral-500">{role}</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-1" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
            
            {actions}
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>

      {/* Mobile Menu Button removed as requested */}
    </div>
  );
}
