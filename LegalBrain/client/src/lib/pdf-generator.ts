import jsPDF from 'jspdf';

export interface FIRData {
  id?: string;
  firNumber: string;
  complainantName: string;
  address: string;
  phoneNumber: string;
  incidentDate: Date;
  incidentTime: string;
  location: string;
  crimeType: string;
  description: string;
  policeStation: string;
  witnessName?: string;
  witnessContact?: string;
  evidenceType?: string;
  status: string;
  createdAt: Date;
  ipcSections?: string[];
  pdfUrl?: string;
  encrypted?: boolean;
}

export function generateFIRPDF(firData: FIRData) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('FIRST INFORMATION REPORT (FIR)', 105, 20, { align: 'center' });
  
  // FIR Number
  doc.setFontSize(14);
  doc.text(`FIR No: ${firData.firNumber || firData.caseId}`, 20, 40);
  
  // Date
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Date: ${new Date(firData.createdAt).toLocaleDateString()}`, 140, 40);
  
  // Crime Type
  doc.setFont(undefined, 'bold');
  doc.text('Type of Crime:', 20, 60);
  doc.setFont(undefined, 'normal');
  doc.text(firData.crimeType || 'Not specified', 80, 60);
  
  // Location
  doc.setFont(undefined, 'bold');
  doc.text('Location of Incident:', 20, 80);
  doc.setFont(undefined, 'normal');
  if (firData.location) {
    const locationLines = doc.splitTextToSize(firData.location, 110);
    doc.text(locationLines, 20, 90);
  }
  
  // Description
  doc.setFont(undefined, 'bold');
  doc.text('Description of Incident:', 20, 120);
  doc.setFont(undefined, 'normal');
  if (firData.description) {
    const descLines = doc.splitTextToSize(firData.description, 170);
    doc.text(descLines, 20, 135);
  }
  
  // Status
  doc.setFont(undefined, 'bold');
  doc.text('Status:', 20, 200);
  doc.setFont(undefined, 'normal');
  doc.text(firData.status || 'Pending', 50, 200);
  
  // Investigating Officer
  if (firData.investigatingOfficer) {
    doc.setFont(undefined, 'bold');
    doc.text('Investigating Officer:', 20, 220);
    doc.setFont(undefined, 'normal');
    doc.text(firData.investigatingOfficer, 90, 220);
  }
  
  // Police Station
  if (firData.policeStation) {
    doc.setFont(undefined, 'bold');
    doc.text('Police Station:', 20, 240);
    doc.setFont(undefined, 'normal');
    doc.text(firData.policeStation, 80, 240);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text('This is a computer generated document.', 105, 280, { align: 'center' });
  
  // Download the PDF
  doc.save(`FIR_${firData.firNumber || firData.caseId}.pdf`);
}
