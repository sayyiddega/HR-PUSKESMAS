/**
 * PDF Generator Utility
 * Generate professional PDF reports with letterhead from master settings
 */

import { Settings, User, DocumentType, UserDocument } from '../../types';

// Load jsPDF dynamically
const loadJsPDF = async () => {
  const { jsPDF } = await import('jspdf');
  return jsPDF;
};

interface EmployeeDocumentReport {
  employee: User;
  documents: UserDocument[];
  documentTypes: DocumentType[];
}

interface AllEmployeesReport {
  employees: Array<{
    employee: User;
    documents: UserDocument[];
  }>;
  documentTypes: DocumentType[];
}

/**
 * Generate PDF report for single employee document checklist
 */
export const generateEmployeeDocumentPDF = async (
  data: EmployeeDocumentReport,
  settings: Settings
): Promise<void> => {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;

  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper to load image as base64
  const loadImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // Header with logo and company info
  const drawHeader = async () => {
    yPos = margin;
    
    // Logo (if available)
    if (settings.logoUrl) {
      try {
        const logoBase64 = await loadImageAsBase64(settings.logoUrl);
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', margin, yPos, 20, 20);
        } else {
          // Placeholder box if logo fails
          doc.setFillColor(200, 200, 200);
          doc.rect(margin, yPos, 20, 20, 'F');
        }
      } catch (e) {
        // If logo fails, just draw a placeholder box
        doc.setFillColor(200, 200, 200);
        doc.rect(margin, yPos, 20, 20, 'F');
      }
    } else {
      // Placeholder box
      doc.setFillColor(200, 200, 200);
      doc.rect(margin, yPos, 20, 20, 'F');
    }

    // Company name and info
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.webName || 'SIKEP Puskesmas', margin + 25, yPos + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (settings.address) {
      doc.text(settings.address, margin + 25, yPos + 14);
    }
    if (settings.phone) {
      doc.text(`Telp: ${settings.phone}`, margin + 25, yPos + 18);
    }

    // Line separator
    yPos += 25;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
  };

  // Title
  const drawTitle = (title: string) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);
    yPos += 8;
  };

  // Employee info section
  const drawEmployeeInfo = () => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMASI PEGAWAI', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nama Lengkap    : ${data.employee.fullName}`, margin + 5, yPos);
    yPos += 6;
    doc.text(`Email              : ${data.employee.username}`, margin + 5, yPos);
    yPos += 6;
    if (data.employee.position) {
      doc.text(`Jabatan           : ${data.employee.position}`, margin + 5, yPos);
      yPos += 6;
    }
    if (data.employee.department) {
      doc.text(`Departemen     : ${data.employee.department}`, margin + 5, yPos);
      yPos += 6;
    }
    yPos += 5;
  };

  // Document checklist table
  const drawDocumentChecklist = () => {
    checkNewPage(30);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CHECKLIST KELENGKAPAN DOKUMEN', margin, yPos);
    yPos += 8;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('No', margin + 2, yPos);
    doc.text('Jenis Dokumen', margin + 12, yPos);
    doc.text('Status', margin + 85, yPos);
    doc.text('Tanggal Upload', margin + 110, yPos);
    yPos += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');
    data.documentTypes.forEach((type, index) => {
      checkNewPage(10);
      
      const docUploaded = data.documents.find(d => d.documentTypeId === type.id);
      const isUploaded = !!docUploaded;
      const status = isUploaded ? 'OK' : 'NOT OK';
      const uploadDate = docUploaded 
        ? new Date(docUploaded.uploadedAt).toLocaleDateString('id-ID')
        : '-';

      // Row background (alternating)
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
      }

      doc.setFontSize(9);
      doc.text((index + 1).toString(), margin + 2, yPos);
      
      // Document name with required indicator
      const docName = type.isRequired ? `${type.name} *` : type.name;
      doc.text(docName, margin + 12, yPos);
      
      // Status - OK (green) or NOT OK (red)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      if (isUploaded) {
        doc.setTextColor(34, 197, 94); // Green
      } else {
        doc.setTextColor(239, 68, 68); // Red
      }
      doc.text(status, margin + 85, yPos);
      doc.setTextColor(0, 0, 0);
      
      // Upload date
      doc.setFont('helvetica', 'normal');
      doc.text(uploadDate, margin + 110, yPos);
      
      yPos += 7;
    });

    yPos += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('* = Dokumen Wajib', margin, yPos);
    yPos += 10;
  };

  // Footer
  const drawFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
      doc.text(
        `Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
        pageWidth - margin,
        footerY,
        { align: 'right' }
      );
      doc.setTextColor(0, 0, 0);
    }
  };

  // Generate PDF
  await drawHeader();
  drawTitle('LAPORAN KELENGKAPAN DOKUMEN PEGAWAI');
  yPos += 5;
  drawEmployeeInfo();
  drawDocumentChecklist();
  drawFooter();

  // Save PDF
  const fileName = `Dokumen_${data.employee.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Generate PDF report for all employees document checklist
 */
export const generateAllEmployeesDocumentPDF = async (
  data: AllEmployeesReport,
  settings: Settings
): Promise<void> => {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;

  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper to load image as base64
  const loadImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // Header
  const drawHeader = async () => {
    yPos = margin;
    
    if (settings.logoUrl) {
      try {
        const logoBase64 = await loadImageAsBase64(settings.logoUrl);
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', margin, yPos, 20, 20);
        } else {
          doc.setFillColor(200, 200, 200);
          doc.rect(margin, yPos, 20, 20, 'F');
        }
      } catch (e) {
        doc.setFillColor(200, 200, 200);
        doc.rect(margin, yPos, 20, 20, 'F');
      }
    } else {
      doc.setFillColor(200, 200, 200);
      doc.rect(margin, yPos, 20, 20, 'F');
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.webName || 'SIKEP Puskesmas', margin + 25, yPos + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (settings.address) {
      doc.text(settings.address, margin + 25, yPos + 14);
    }
    if (settings.phone) {
      doc.text(`Telp: ${settings.phone}`, margin + 25, yPos + 18);
    }

    yPos += 25;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
  };

  // Draw header first
  await drawHeader();

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN KELENGKAPAN DOKUMEN SEMUA PEGAWAI', margin, yPos);
  yPos += 10;

  // Summary table for each employee
  data.employees.forEach((empData, empIndex) => {
    checkNewPage(40);

    // Employee header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${empIndex + 1}. ${empData.employee.fullName}`, margin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${empData.employee.username}`, margin + 5, yPos);
    yPos += 5;
    if (empData.employee.position) {
      doc.text(`Jabatan: ${empData.employee.position}`, margin + 5, yPos);
      yPos += 5;
    }

    // Checklist table
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 6, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Jenis Dokumen', margin + 2, yPos);
    doc.text('Status', margin + 100, yPos);
    yPos += 6;

    data.documentTypes.forEach((type) => {
      checkNewPage(8);
      
      const docUploaded = empData.documents.find(d => d.documentTypeId === type.id);
      const isUploaded = !!docUploaded;
      const status = isUploaded ? 'OK' : 'NOT OK';

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const docName = type.isRequired ? `${type.name} *` : type.name;
      doc.text(docName, margin + 2, yPos);
      
      // Status - OK (green) or NOT OK (red)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      if (isUploaded) {
        doc.setTextColor(34, 197, 94); // Green
      } else {
        doc.setTextColor(239, 68, 68); // Red
      }
      doc.text(status, margin + 100, yPos);
      doc.setTextColor(0, 0, 0);
      
      yPos += 6;
    });

    yPos += 8;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    doc.text(
      `Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
      pageWidth - margin,
      footerY,
      { align: 'right' }
    );
    doc.setTextColor(0, 0, 0);
  }

  const fileName = `Laporan_Dokumen_Semua_Pegawai_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
