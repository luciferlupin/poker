import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaction, KycRecord, User, MembershipPlan } from './types';

// PDF Header helper
const applyPdfHeader = (doc: jsPDF, title: string) => {
  doc.setFillColor(10, 11, 14); // Dark obsidian
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, 'F');

  doc.setTextColor(212, 175, 55); // Champagne Gold
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MONACO ROYAL POKER CLUB', 14, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(title.toUpperCase(), 14, 28);

  doc.setFontSize(9);
  doc.setTextColor(158, 167, 189);
  doc.text(`Generated: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() - 14, 28, { align: 'right' });
};

// 1. Export Transactions PDF
export const exportTransactionsPDF = (transactions: Transaction[]) => {
  const doc = new jsPDF();
  applyPdfHeader(doc, 'Official Chip Transaction Ledger & Audit Report');

  const tableData = transactions.map((t) => [
    t.txnCode,
    t.userName,
    t.type.replace(/_/g, ' '),
    `$${t.amount.toLocaleString()}`,
    t.method || 'SYSTEM',
    t.actionBy,
    t.status,
    new Date(t.createdAt).toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['TXN ID', 'User Name', 'Type', 'Amount', 'Method', 'Action By', 'Status', 'Date']],
    body: tableData,
    headStyles: { fillColor: [13, 59, 46], textColor: [212, 175, 55], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 246, 250] },
    styles: { fontSize: 8 },
  });

  doc.save(`PokerClub_Transactions_${Date.now()}.pdf`);
};

// 2. Export Transactions Excel
export const exportTransactionsExcel = (transactions: Transaction[]) => {
  const data = transactions.map((t) => ({
    'Transaction Code': t.txnCode,
    'User Name': t.userName,
    'User ID': t.userId,
    Type: t.type,
    'Amount (Chips)': t.amount,
    Method: t.method || 'SYSTEM',
    'Action By': t.actionBy,
    Status: t.status,
    Notes: t.notes || '',
    'Date & Time': new Date(t.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, `PokerClub_Transactions_${Date.now()}.xlsx`);
};

// 3. Export KYC Compliance PDF
export const exportKycReportPDF = (kycRecords: KycRecord[]) => {
  const doc = new jsPDF();
  applyPdfHeader(doc, 'KYC Verification & Compliance Audit Report');

  const tableData = kycRecords.map((k) => [
    k.fullName,
    k.email,
    k.govIdType.replace(/_/g, ' '),
    k.govIdNumber,
    k.country,
    k.status,
    new Date(k.submittedAt).toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['Full Name', 'Email Address', 'Gov ID Type', 'ID Number', 'Country', 'Status', 'Submitted Date']],
    body: tableData,
    headStyles: { fillColor: [13, 59, 46], textColor: [212, 175, 55], fontStyle: 'bold' },
    styles: { fontSize: 8 },
  });

  doc.save(`PokerClub_KYC_Report_${Date.now()}.pdf`);
};

// 4. Export KYC Compliance Excel
export const exportKycReportExcel = (kycRecords: KycRecord[]) => {
  const data = kycRecords.map((k) => ({
    'Full Name': k.fullName,
    'Player User ID': k.userId,
    Email: k.email,
    Phone: k.phone,
    'Gov ID Type': k.govIdType,
    'ID Number': k.govIdNumber,
    Address: `${k.address}, ${k.city}, ${k.state}, ${k.country}`,
    'Emergency Contact': `${k.emergencyContactName} (${k.emergencyContactPhone})`,
    'Referral Source': k.referralSource,
    Status: k.status,
    'Reviewed By': k.reviewedBy || 'N/A',
    'Review Notes': k.notes || 'N/A',
    'Submitted Date': new Date(k.submittedAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'KYC Compliance');
  XLSX.writeFile(workbook, `PokerClub_KYC_Report_${Date.now()}.xlsx`);
};

// 5. Export Chip Circulation PDF
export const exportChipCirculationPDF = (users: User[]) => {
  const doc = new jsPDF();
  applyPdfHeader(doc, 'Player Chip Circulation & Balance Report');

  const totalChips = users.reduce((acc, u) => acc + u.chipBalance, 0);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  doc.text(`Total Active Members: ${users.length} | Total Chips in Circulation: $${totalChips.toLocaleString()} Chips`, 14, 40);

  const tableData = users.map((u) => [
    u.playerCode,
    u.name,
    u.role,
    u.membershipTier.replace(/_/g, ' '),
    u.kycStatus,
    `₹${u.chipBalance.toLocaleString('en-IN')}`,
    new Date(u.joinedDate || Date.now()).toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: 46,
    head: [['Player Code', 'Name', 'Role', 'Membership Tier', 'KYC Status', 'Chip Balance (INR)', 'Joined Date']],
    body: tableData,
    headStyles: { fillColor: [13, 59, 46], textColor: [212, 175, 55], fontStyle: 'bold' },
    styles: { fontSize: 8 },
  });

  doc.save(`PokerClub_Chip_Circulation_${Date.now()}.pdf`);
};

// 6. Export Chip Circulation Excel
export const exportChipCirculationExcel = (users: User[]) => {
  const data = users.map((u) => ({
    'Player Code': u.playerCode,
    Name: u.name,
    Email: u.email,
    Phone: u.phone,
    Role: u.role,
    'Membership Tier': u.membershipTier,
    'KYC Status': u.kycStatus,
    'Chip Balance (INR)': u.chipBalance,
    'Registration Date': new Date(u.joinedDate || Date.now()).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Chip Circulation');
  XLSX.writeFile(workbook, `PokerClub_Chip_Circulation_${Date.now()}.xlsx`);
};

// 7. Export Membership Report PDF
export const exportMembershipReportPDF = (memberships: MembershipPlan[]) => {
  const doc = new jsPDF();
  applyPdfHeader(doc, 'Membership Tier Pricing & Enrolment Report');

  const tableData = memberships.map((m) => [
    m.name,
    m.tier,
    `$${m.priceMonthly}/mo`,
    `$${m.maxTableLimit.toLocaleString()}`,
    `${m.cashoutFeePercent}%`,
    m.activeMembersCount,
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['Plan Name', 'Tier Code', 'Monthly Price', 'Max Buy-in Limit', 'Cashout Fee', 'Enrolled Members']],
    body: tableData,
    headStyles: { fillColor: [13, 59, 46], textColor: [212, 175, 55], fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });

  doc.save(`PokerClub_Memberships_${Date.now()}.pdf`);
};
