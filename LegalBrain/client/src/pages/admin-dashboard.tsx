import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import StatsCard from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessageSquare, Server, UserPlus, Activity } from "lucide-react";
import Header from "@/components/layout/header";

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated && !isLoading && user?.role === 'admin',
    retry: false,
  });

  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ["/api/audit"],
    enabled: isAuthenticated && !isLoading && user?.role === 'admin',
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

    if (!isLoading && user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "This section is only accessible to administrators.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, user?.role, toast]);

  if (isLoading || statsLoading || auditLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal mb-4">Access Denied</h1>
          <p className="text-gray-600">This section is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Admin Dashboard" 
        subtitle="System overview and management"
      />

      <div className="space-y-8">
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Total FIRs"
            value={stats?.totalFIRs || 0}
            icon={FileText}
            color="green"
          />
          <StatsCard
            title="Chat Sessions"
            value={stats?.totalChatSessions || 0}
            icon={MessageSquare}
            color="purple"
          />
          <StatsCard
            title="System Uptime"
            value="99.9%"
            icon={Server}
            color="green"
          />
        </div>

        {/* System Activities */}
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-charcoal">
              Recent System Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditLogs && auditLogs.length > 0 ? (
              <div className="space-y-4">
                {auditLogs.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {log.module === 'fir' && <FileText className="h-4 w-4 text-primary" />}
                      {log.module === 'chat' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                      {log.module === 'user' && <UserPlus className="h-4 w-4 text-secondary" />}
                      {!['fir', 'chat', 'user'].includes(log.module) && <Activity className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">
                        {log.action === 'create' && 'Created'} 
                        {log.action === 'update' && 'Updated'} 
                        {log.action === 'delete' && 'Deleted'} 
                        {log.module}
                      </p>
                      <p className="text-xs text-gray-600">
                        User: {log.userId} • {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No audit logs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
