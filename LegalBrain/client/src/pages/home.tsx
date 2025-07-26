import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import StatsCard from "@/components/dashboard/stats-card";
import CaseChart from "@/components/dashboard/case-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  MessageSquare, 
  FileText, 
  Search, 
  CheckCircle, 
  Clock,
  Scale,
  User
} from "lucide-react";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: userFIRs } = useQuery({
    queryKey: ["/api/fir/user"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  const { data: userCases } = useQuery({
    queryKey: ["/api/cases/user"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filedFIRs = userFIRs?.length || 0;
  const activeCases = userCases?.filter((c: any) => 
    c.status === 'under_investigation' || c.status === 'court_proceedings'
  ).length || 0;
  const resolvedCases = userCases?.filter((c: any) => c.status === 'disposed').length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-charcoal">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your legal matters and access AI-powered assistance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Filed FIRs"
          value={filedFIRs}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Active Cases"
          value={activeCases}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Resolved"
          value={resolvedCases}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Chat Sessions"
          value="15"
          icon={MessageSquare}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-charcoal">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/chatbot">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <MessageSquare className="mr-3 h-4 w-4 text-primary" />
                Ask Legal Assistant
              </Button>
            </Link>
            <Link href="/fir">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-green-50 hover:bg-green-100 border-green-200"
              >
                <FileText className="mr-3 h-4 w-4 text-secondary" />
                File New FIR
              </Button>
            </Link>
            <Link href="/cases">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-purple-50 hover:bg-purple-100 border-purple-200"
              >
                <Search className="mr-3 h-4 w-4 text-purple-600" />
                Track Case Status
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2 border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-charcoal">
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userFIRs && userFIRs.length > 0 ? (
                userFIRs.slice(0, 3).map((fir: any) => (
                  <div key={fir.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">
                        FIR Filed: {fir.firNumber}
                      </p>
                      <p className="text-xs text-gray-600">
                        {fir.crimeType} • {new Date(fir.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Scale className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activities</p>
                  <p className="text-sm text-gray-400">Start by filing an FIR or asking the legal assistant</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Status Chart */}
      {userCases && userCases.length > 0 && (
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-charcoal">
              Case Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CaseChart cases={userCases} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
