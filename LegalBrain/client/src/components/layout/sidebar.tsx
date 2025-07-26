import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Scale, 
  Home, 
  MessageSquare, 
  FileText, 
  Search, 
  User,
  Users,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  FolderOpen,
  ClipboardList
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const citizenNavItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/chatbot", icon: MessageSquare, label: "Legal Assistant" },
    { href: "/fir", icon: FileText, label: "File FIR" },
    { href: "/cases", icon: Search, label: "Track Cases" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const policeNavItems = [
    { href: "/police", icon: Home, label: "Dashboard" },
    { href: "/fir-management", icon: FolderOpen, label: "Manage FIRs" },
    { href: "/assigned-cases", icon: ClipboardList, label: "Assigned Cases" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
  ];

  const adminNavItems = [
    { href: "/admin", icon: Home, label: "Dashboard" },
    { href: "/users", icon: Users, label: "User Management" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/audit", icon: Shield, label: "Audit Logs" },
    { href: "/settings", icon: Settings, label: "System Settings" },
  ];

  const getNavItems = () => {
    switch (user?.role) {
      case 'police':
        return policeNavItems;
      case 'admin':
        return adminNavItems;
      default:
        return citizenNavItems;
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-primary">
          <div className="flex items-center space-x-2">
            <Scale className="text-white text-xl" />
            <span className="text-white font-bold text-lg">LegalAI</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-charcoal">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-600 capitalize">
                {user?.role || 'Citizen'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {getNavItems().map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer",
                  isActive
                    ? "text-primary bg-blue-50 font-medium"
                    : "text-gray-600 hover:text-primary hover:bg-blue-50"
                )}>
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-accent transition-colors py-2 rounded-lg hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
