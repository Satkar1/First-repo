import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Chatbot from "@/pages/chatbot";
import FIRFiling from "@/pages/fir-filing";
import CaseTracking from "@/pages/case-tracking";
import Profile from "@/pages/profile";
import PoliceDashboard from "@/pages/police-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-64">
              <Header />
              <main className="p-6">
                <Route path="/" component={Home} />
                <Route path="/chatbot" component={Chatbot} />
                <Route path="/fir" component={FIRFiling} />
                <Route path="/cases" component={CaseTracking} />
                <Route path="/profile" component={Profile} />
                <Route path="/police" component={PoliceDashboard} />
                <Route path="/admin" component={AdminDashboard} />
              </main>
            </div>
          </div>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
