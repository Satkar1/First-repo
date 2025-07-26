import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, Send, Brain } from "lucide-react";

const firSchema = z.object({
  crimeType: z.string().min(1, "Crime type is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  location: z.string().min(10, "Location must be at least 10 characters"),
  incidentDate: z.string().min(1, "Incident date is required"),
  incidentTime: z.string().min(1, "Incident time is required"),
});

type FIRFormData = z.infer<typeof firSchema>;

interface FIRFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  user: any;
}

export default function FIRForm({ onSubmit, isSubmitting, user }: FIRFormProps) {
  const [ipcSuggestions, setIpcSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const form = useForm<FIRFormData>({
    resolver: zodResolver(firSchema),
    defaultValues: {
      crimeType: "",
      description: "",
      location: "",
      incidentDate: "",
      incidentTime: "",
    },
  });

  const suggestionMutation = useMutation({
    mutationFn: async ({ description, crimeType }: { description: string; crimeType: string }) => {
      const response = await apiRequest("POST", "/api/ai/ipc-suggestions", { description, crimeType });
      return response.json();
    },
    onSuccess: (data) => {
      setIpcSuggestions(data.suggestions);
      setShowSuggestions(true);
      toast({
        title: "AI Analysis Complete",
        description: "IPC sections suggested based on your description",
      });
    },
  });

  const handleGenerateSuggestions = () => {
    const description = form.getValues("description");
    const crimeType = form.getValues("crimeType");
    
    if (description.length > 20 && crimeType) {
      suggestionMutation.mutate({ description, crimeType });
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in crime type and provide a detailed description",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (data: FIRFormData) => {
    const selectedSections = ipcSuggestions
      .filter((_, index) => (document.getElementById(`ipc-${index}`) as HTMLInputElement)?.checked)
      .map(s => s.section);

    onSubmit({
      ...data,
      ipcSections: selectedSections,
      incidentDate: new Date(data.incidentDate),
    });
  };

  const crimeTypes = [
    "Theft",
    "Fraud",
    "Assault",
    "Cybercrime",
    "Domestic Violence",
    "Property Dispute",
    "Other"
  ];

  return (
    <Card className="border border-gray-100">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-charcoal">
          File First Information Report (FIR)
        </CardTitle>
        <p className="text-gray-600">
          Provide detailed information about the incident. Our AI will suggest relevant IPC sections.
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Full Name</label>
                    <Input 
                      value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()} 
                      disabled 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
                    <Input value={user?.email || ''} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Details */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Incident Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="incidentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Incident</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="incidentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time of Incident</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location of Incident</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide detailed location including landmark, area, city, state, pin code"
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="crimeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Crime</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select crime type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {crimeTypes.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase()}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a detailed account of what happened. Include sequence of events, people involved, evidence available, etc."
                          className="h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  onClick={handleGenerateSuggestions}
                  disabled={suggestionMutation.isPending}
                  className="bg-blue-50 text-primary border border-blue-200 hover:bg-blue-100"
                  variant="outline"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Generate AI IPC Suggestions
                </Button>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {showSuggestions && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    AI Suggested IPC Sections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ipcSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded border">
                        <input 
                          type="checkbox" 
                          id={`ipc-${index}`}
                          defaultChecked={suggestion.confidence > 0.8}
                          className="text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-charcoal">
                            Section {suggestion.section} - {suggestion.title}
                          </span>
                          <p className="text-xs text-gray-600 mt-1">
                            {suggestion.description}
                          </p>
                          <span className="text-xs text-blue-600">
                            Confidence: {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-blue-700"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit FIR"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
