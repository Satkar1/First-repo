import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import FIRForm from "@/components/fir/fir-form";
import Header from "@/components/layout/header";

export default function FIRFiling() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const firMutation = useMutation({
    mutationFn: async (firData: any) => {
      const response = await apiRequest("POST", "/api/fir/generate", firData);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "FIR Submitted Successfully",
        description: `Your FIR has been filed with number: ${data.firNumber}`,
      });
      
      // Auto-download PDF if available
      if (data.pdfUrl) {
        setTimeout(() => {
          import("@/lib/pdf-generator").then(({ generateFIRPDF }) => {
            generateFIRPDF(data);
          });
        }, 1000);
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to submit FIR. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="File First Information Report (FIR)" 
        subtitle="Report incidents and file complaints with AI assistance"
      />
      <div className="max-w-4xl mx-auto">
        <FIRForm 
          onSubmit={(data) => firMutation.mutate(data)}
          isSubmitting={firMutation.isPending}
          user={user}
        />
      </div>
    </div>
  );
}
