import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import StatsCard from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search, CheckCircle, Calendar, Eye, UserCheck } from "lucide-react";
import Header from "@/components/layout/header";

export default function PoliceDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: allFIRs, isLoading: firsLoading } = useQuery({
    queryKey: ["/api/fir/all"],
    enabled: isAuthenticated && !isLoading && user?.role === 'police',
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

    if (!isLoading && user?.role !== 'police') {
      toast({
        title: "Access Denied",
        description: "This section is only accessible to police personnel.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, user?.role, toast]);

  if (isLoading || firsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.role !== 'police') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal mb-4">Access Denied</h1>
          <p className="text-gray-600">This section is only accessible to police personnel.</p>
        </div>
      </div>
    );
  }

  const pendingFIRs = allFIRs?.filter((fir: any) => fir.status === 'pending').length || 0;
  const investigatingFIRs = allFIRs?.filter((fir: any) => fir.status === 'investigating').length || 0;
  const completedFIRs = allFIRs?.filter((fir: any) => fir.status === 'disposed').length || 0;
  const thisMonthFIRs = allFIRs?.filter((fir: any) => {
    const firDate = new Date(fir.createdAt);
    const currentDate = new Date();
    return firDate.getMonth() === currentDate.getMonth() && 
           firDate.getFullYear() === currentDate.getFullYear();
  }).length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'chargesheet_filed':
        return 'bg-purple-100 text-purple-800';
      case 'disposed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <Header 
        title="Police Dashboard" 
        subtitle="Manage FIRs and investigations"
      />

      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Pending FIRs"
            value={pendingFIRs}
            icon={AlertTriangle}
            color="red"
          />
          <StatsCard
            title="Under Investigation"
            value={investigatingFIRs}
            icon={Search}
            color="yellow"
          />
          <StatsCard
            title="Completed"
            value={completedFIRs}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="This Month"
            value={thisMonthFIRs}
            icon={Calendar}
            color="blue"
          />
        </div>

        {/* Recent FIRs Table */}
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-charcoal">
              Recent FIRs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allFIRs && allFIRs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        FIR ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allFIRs.slice(0, 10).map((fir: any) => (
                      <tr key={fir.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal">
                          {fir.firNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {fir.crimeType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(fir.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(fir.status)}>
                            {fir.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          {fir.status === 'pending' && (
                            <Button size="sm" className="bg-secondary hover:bg-green-700">
                              <UserCheck className="mr-1 h-3 w-3" />
                              Assign
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No FIRs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
