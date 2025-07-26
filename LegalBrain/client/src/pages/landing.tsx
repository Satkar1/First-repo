import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, Shield, Users, Brain } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Scale className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-charcoal mb-4">
            AI-Powered Legal Assistance System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Secure, intelligent, and comprehensive legal services platform with AI chatbot, 
            FIR filing, case tracking, and role-based dashboards
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-primary hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            Access Legal Portal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal mb-2">AI Legal Assistant</h3>
              <p className="text-sm text-gray-600">Intelligent chatbot for legal guidance and support</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal mb-2">FIR Filing</h3>
              <p className="text-sm text-gray-600">AI-powered FIR drafting with IPC suggestions</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Scale className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal mb-2">Case Tracking</h3>
              <p className="text-sm text-gray-600">Real-time case status and court updates</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal mb-2">Role-Based Access</h3>
              <p className="text-sm text-gray-600">Citizen, Police, and Admin dashboards</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-charcoal mb-6 text-center">
            Secure Legal Services Portal
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-gray-700">Multilingual support (English, Hindi, Marathi)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="text-gray-700">End-to-end encryption for sensitive data</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-gray-700">Real-time case status updates</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-gray-700">Comprehensive audit logging</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              onClick={handleLogin}
              className="bg-primary hover:bg-blue-700 text-white"
            >
              Get Started
            </Button>
            <p className="text-sm text-gray-600 mt-4">
              New to the portal? Your account will be created automatically upon first login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
