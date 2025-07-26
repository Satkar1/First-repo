import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Eye, Calendar, MapPin, User } from "lucide-react";
import { generateFIRPDF } from "@/lib/pdf-generator";

interface Case {
  id: string;
  type: 'fir' | 'case';
  title: string;
  caseId?: string;
  firNumber?: string;
  status: string;
  crimeType?: string;
  location?: string;
  createdAt: string;
  investigatingOfficer?: string;
  policeStation?: string;
  court?: string;
  judge?: string;
  hearingDate?: string;
  nextHearing?: string;
}

interface CaseListProps {
  cases: Case[];
}

export default function CaseList({ cases }: CaseListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.firNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || case_.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
      case 'under_investigation':
        return 'bg-blue-100 text-blue-800';
      case 'chargesheet_filed':
        return 'bg-purple-100 text-purple-800';
      case 'court_proceedings':
        return 'bg-indigo-100 text-indigo-800';
      case 'disposed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressSteps = (status: string) => {
    const steps = ['pending', 'investigating', 'chargesheet_filed', 'court_proceedings', 'disposed'];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({
      step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const handleDownloadFIR = (case_: Case) => {
    if (case_.type === 'fir') {
      generateFIRPDF(case_);
    }
  };

  if (!cases.length) {
    return (
      <Card className="border border-gray-100">
        <CardContent className="p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-charcoal mb-2">No Cases Found</h3>
          <p className="text-gray-600">You haven't filed any FIRs or have any active cases yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by Case ID, FIR Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="chargesheet_filed">Chargesheet Filed</SelectItem>
                  <SelectItem value="court_proceedings">Court Proceedings</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map((case_) => (
          <Card key={case_.id} className="border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal">
                    {case_.firNumber || case_.caseId}
                  </h3>
                  <p className="text-gray-600 text-sm">{case_.crimeType || 'Legal Case'}</p>
                </div>
                <Badge className={getStatusColor(case_.status)}>
                  {case_.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Filed Date</p>
                    <p className="font-medium text-charcoal">
                      {new Date(case_.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {case_.policeStation && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Police Station</p>
                      <p className="font-medium text-charcoal">{case_.policeStation}</p>
                    </div>
                  </div>
                )}
                
                {case_.investigatingOfficer && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Investigating Officer</p>
                      <p className="font-medium text-charcoal">{case_.investigatingOfficer}</p>
                    </div>
                  </div>
                )}

                {case_.court && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Court</p>
                      <p className="font-medium text-charcoal">{case_.court}</p>
                    </div>
                  </div>
                )}

                {case_.nextHearing && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Next Hearing</p>
                      <p className="font-medium text-charcoal">
                        {new Date(case_.nextHearing).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Timeline */}
              <div className="mb-4">
                <p className="text-sm font-medium text-charcoal mb-3">Progress</p>
                <div className="flex items-center space-x-2">
                  {getProgressSteps(case_.status).map((step, index) => (
                    <div key={step.step} className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          step.completed ? 'bg-secondary' : 
                          step.current ? 'bg-yellow-400' : 'bg-gray-200'
                        }`}
                      />
                      {index < 4 && (
                        <div
                          className={`flex-1 h-1 mx-2 ${
                            step.completed ? 'bg-secondary' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Filed</span>
                  <span>Investigation</span>
                  <span>Chargesheet</span>
                  <span>Court</span>
                  <span>Disposed</span>
                </div>
              </div>

              {/* Next hearing reminder */}
              {case_.nextHearing && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <Calendar className="inline mr-2 h-4 w-4" />
                    Reminder: Next hearing scheduled for {new Date(case_.nextHearing).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" className="bg-blue-50 text-primary hover:bg-blue-100">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                {case_.type === 'fir' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-green-50 text-secondary hover:bg-green-100"
                    onClick={() => handleDownloadFIR(case_)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download FIR
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
