import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import CaseList from "@/components/cases/case-list";
import Header from "@/components/layout/header";

export default function CaseTracking() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userFIRs, isLoading: firsLoading } = useQuery({
    queryKey: ["/api/fir/user"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  const { data: userCases, isLoading: casesLoading } = useQuery({
    queryKey: ["/api/case-status"],
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

  if (isLoading || firsLoading || casesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Combine FIRs and cases for display
  const allCases = [
    ...(userFIRs || []).map((fir: any) => ({
      ...fir,
      type: 'fir',
      caseId: fir.firNumber,
      title: `${fir.firNumber} - ${fir.crimeType}`,
    })),
    ...(userCases || []).map((case_: any) => ({
      ...case_,
      type: 'case',
      title: `${case_.caseId} - Court Case`,
    }))
  ];

  return (
    <div>
      <Header 
        title="Track Cases" 
        subtitle="Monitor your case progress and updates"
      />
      <CaseList cases={allCases} />
    </div>
  );
}
