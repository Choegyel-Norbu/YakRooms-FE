import jsPDF from 'jspdf';

/**
 * Helper function to load image as base64
 */
const loadImageAsBase64 = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL('image/jpeg');
        resolve(imgData);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
};

/**
 * Generates a modern PDF receipt matching the ProInvoice-style template
 * Uses only fields from the API receipt response
 * 
 * @param {Object} booking - Booking object (kept for backward compatibility, but not used)
 * @param {Object} receiptData - Receipt data from API response
 */
export const generateBookingReceipt = async (booking, receiptData = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Determine receipt type
  const receiptType = receiptData.receiptType || 'BOOKING';
  const isBooking = receiptType === 'BOOKING';
  const isSubscription = receiptType === 'SUBSCRIPTION';

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const currency = receiptData.currency || 'BTN';
    const symbol = currency === 'BTN' ? 'Nu.' : currency;
    return `${symbol} ${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to format date (e.g., "19th Jul, 2022")
  const formatDateLong = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const daySuffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}${daySuffix} ${month}, ${year}`;
  };

  // Header without background
  const headerHeight = 50;
  // Background removed - no wave pattern
  yPosition = headerHeight - 15;

  // EzeeRoom Logo (left side)
  const logoWidth = 60;
  const logoHeight = 20;
  try {
    const logoImageData = await loadImageAsBase64('/images/receiptLogo.png');
    doc.addImage(logoImageData, 'PNG', margin, margin, logoWidth, logoHeight);
  } catch (error) {
    // If logo fails to load, use a simple text fallback
    console.warn('Receipt logo could not be loaded, using text fallback:', error);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EzeeRoom', margin, margin + 10);
  }

  // Receipt title (right side, large)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const receiptTitle = isBooking ? 'Booking Receipt' : 'Subscription Receipt';
  doc.text(receiptTitle, pageWidth - margin, margin + 10, { align: 'right' });

  // Sender information (right side, below title) - Using only receiptData fields
  doc.setFontSize(10); // text-sm equivalent
  doc.setFont('helvetica', 'normal');
  const companyName = receiptData.hotelName || 'Name of business';
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, pageWidth - margin, margin + 20, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  const hotelPhone = receiptData.hotelPhone || '';
  doc.text(hotelPhone, pageWidth - margin, margin + 26, { align: 'right' });
  
  const hotelEmail = receiptData.hotelEmail || '';
  doc.text(hotelEmail, pageWidth - margin, margin + 32, { align: 'right' });

  yPosition = headerHeight + 15;

  // Recipient and Transaction Details Section
  const leftColumnX = margin;
  // For subscription receipts, move transaction details to the left since customer details are hidden
  const rightColumnStartX = isSubscription ? margin : pageWidth / 2 + 5; // Start of right column - moved earlier for more width
  const rightColumnValueX = pageWidth - margin; // X position for values

  // Only show customer details for booking receipts, not subscription receipts
  let customerNameY = headerHeight + 15; // Track where customer name starts
  if (!isSubscription) {
    // Customer Details title
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details', leftColumnX, yPosition);
    yPosition += 8;
    
    const recipientName = receiptData.customerName || 'Name of customer';
    customerNameY = yPosition; // Store the Y position of customer name
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(recipientName, leftColumnX, yPosition);
    yPosition += 7;

    const customerPhone = receiptData.customerPhone || '';
    doc.setFontSize(10);
    if (customerPhone) {
      doc.text(customerPhone, leftColumnX, yPosition);
      yPosition += 7;
    }

    const customerEmail = receiptData.customerEmail || '';
    if (customerEmail) {
      doc.text(customerEmail, leftColumnX, yPosition);
      yPosition += 7;
    }
  }
  
  // Transaction Details (right column) - Start aligned with customer name (not the title)
  // Leave one row spacing, then align with customer name position
  let rightY = customerNameY; // Align with customer name position

  // Receipt Number - Allow text wrapping for long receipt numbers
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const invoiceLabel = 'Receipt No:';
  doc.text(invoiceLabel, rightColumnStartX, rightY);
  const receiptNumber = receiptData.receiptNumber || 'N/A';
  doc.setFont('helvetica', 'bold');
  // For booking receipts, use smaller font and 70% width
  if (isBooking) {
    doc.setFontSize(8); // Smaller font size for receipt number value
    // Calculate available width for receipt number - use 70% of available width
    const availableWidth = rightColumnValueX - rightColumnStartX;
    const receiptNumberWidth = availableWidth * 0.7; // 70% width
    const receiptNumberLines = doc.splitTextToSize(receiptNumber, receiptNumberWidth);
    // Render each line individually with consistent spacing (matching customer details)
    let receiptNumberY = rightY;
    receiptNumberLines.forEach((line, index) => {
      doc.text(line, rightColumnValueX, receiptNumberY, { align: 'right' });
      // Only add spacing if not the last line
      if (index < receiptNumberLines.length - 1) {
        receiptNumberY += 7; // Same spacing as customer details
      }
    });
    // Move to next position after all lines (same as customer details spacing)
    rightY = receiptNumberY + 7;
  } else {
    // For subscription receipts, use default sizing
    const receiptNumberWidth = rightColumnValueX - rightColumnStartX - 50; // Leave space for label
    const receiptNumberLines = doc.splitTextToSize(receiptNumber, receiptNumberWidth);
    // Render each line individually with consistent spacing (matching customer details)
    let receiptNumberY = rightY;
    receiptNumberLines.forEach((line, index) => {
      doc.text(line, rightColumnValueX, receiptNumberY, { align: 'right' });
      // Only add spacing if not the last line
      if (index < receiptNumberLines.length - 1) {
        receiptNumberY += 7; // Same spacing as customer details
      }
    });
    // Move to next position after all lines (same as customer details spacing)
    rightY = receiptNumberY + 7;
  }

  // Receipt Date - Use today's date
  const dateLabel = 'Receipt Date:';
  doc.setFont('helvetica', 'normal');
  doc.text(dateLabel, rightColumnStartX, rightY);
  const invoiceDate = formatDateLong(new Date()); // Always use today's date
  doc.text(invoiceDate, rightColumnValueX, rightY, { align: 'right' });
  rightY += 8;

  // Payment Date
  doc.text('Payment Date:', rightColumnStartX, rightY);
  const paymentDate = formatDateLong(receiptData.updatedAt || receiptData.issueDate || new Date());
  doc.text(paymentDate, rightColumnValueX, rightY, { align: 'right' });

  yPosition = Math.max(yPosition, rightY) + 20;

  // Itemized List Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Table header background
  doc.setFillColor(240, 240, 240);
  const tableHeaderHeight = 12;
  doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, tableHeaderHeight, 'F');
  
  // Table columns - Adjusted to fit within page width
  // Calculate available width (page width minus margins and padding)
  const availableWidth = pageWidth - 2 * margin - 10; // 10 for padding
  const colWidths = {
    item: Math.floor(availableWidth * 0.35), // 35% for item
    quantity: Math.floor(availableWidth * 0.12), // 12% for quantity
    unitPrice: Math.floor(availableWidth * 0.18), // 18% for unit price
    discount: Math.floor(availableWidth * 0.15), // 15% for discount
    amount: Math.floor(availableWidth * 0.20) // 20% for amount
  };
  
  // Calculate column positions for better alignment
  const colPositions = {
    item: margin + 5,
    quantity: margin + 5 + colWidths.item,
    unitPrice: margin + 5 + colWidths.item + colWidths.quantity,
    discount: margin + 5 + colWidths.item + colWidths.quantity + colWidths.unitPrice,
    amount: margin + 5 + colWidths.item + colWidths.quantity + colWidths.unitPrice + colWidths.discount
  };
  
  // Ensure amount column doesn't exceed page width
  const maxAmountX = pageWidth - margin - 5;
  if (colPositions.amount > maxAmountX) {
    // Adjust if needed
    const adjustment = colPositions.amount - maxAmountX;
    colPositions.amount = maxAmountX;
    colPositions.discount = colPositions.discount - (adjustment / 2);
  }
  
  // Table headers - Left aligned to prevent overflow
  doc.text('Item', colPositions.item, yPosition);
  doc.text('Quantity', colPositions.quantity, yPosition);
  doc.text('Unit Price', colPositions.unitPrice, yPosition);
  // Use shorter text for discount to fit better
  doc.text('Discount', colPositions.discount, yPosition);
  doc.text('Amount', colPositions.amount, yPosition);
  
  yPosition += 10;

  // Table row - Using only receiptData fields
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Get total amount directly from receiptData (no tax calculation)
  const totalPaidAmount = receiptData.amount || 0;
  
  // Item description from receiptData
  const itemDescription = receiptData.description || (isBooking ? 'Booking Payment' : 'Subscription Payment');
  const quantity = 1; // Default to 1 since we don't have quantity in receiptData
  const unitPrice = totalPaidAmount; // Since quantity is 1, unit price equals total amount
  const discount = 0; // Default to 0% discount

  // Item row - Using fixed column positions
  doc.text(itemDescription, colPositions.item, yPosition);
  doc.text(String(quantity), colPositions.quantity, yPosition);
  doc.text(formatCurrency(unitPrice), colPositions.unitPrice, yPosition);
  doc.text(`${discount}%`, colPositions.discount, yPosition);
  doc.text(formatCurrency(totalPaidAmount), colPositions.amount, yPosition);
  
  yPosition += 15;

  // Summary of Charges (right aligned) - Better alignment
  const summaryLabelX = pageWidth - margin - 80; // Label position
  const summaryValueX = pageWidth - margin; // Value position
  
  // TOTAL
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const totalAmount = totalPaidAmount;
  doc.text('TOTAL:', summaryLabelX, yPosition, { align: 'right' });
  doc.text(formatCurrency(totalAmount), summaryValueX, yPosition, { align: 'right' });
  yPosition += 20;

  // Payment Status Display - Better alignment
  const statusBarHeight = 25;
  const statusBarY = yPosition;
  const paidButtonWidth = 45;
  const gapBetweenButtons = 5;
  
  // PAID button (left side) - Properly centered text
  doc.setFillColor(59, 130, 246); // Blue
  doc.roundedRect(margin, statusBarY, paidButtonWidth, statusBarHeight, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  // Center text in button - calculate center X position
  const paidButtonCenterX = margin + (paidButtonWidth / 2);
  doc.text('PAID', paidButtonCenterX, statusBarY + (statusBarHeight / 2) + 3, { align: 'center' });
  
  // Amount (right side) - Better alignment
  const amountBoxX = margin + paidButtonWidth + gapBetweenButtons;
  const amountBoxWidth = pageWidth - amountBoxX - margin;
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(amountBoxX, statusBarY, amountBoxWidth, statusBarHeight, 3, 3, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  // Align amount to right with proper padding
  doc.text(formatCurrency(totalAmount), pageWidth - margin - 5, statusBarY + (statusBarHeight / 2) + 3, { align: 'right' });
  
  yPosition = statusBarY + statusBarHeight + 25;

  // Company Details Section (Ezeeroom)
  const companySectionY = yPosition;
  
  // Add a separator line
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, companySectionY, pageWidth - margin, companySectionY);
  yPosition += 15;

  // Company Details (Left side)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const companyDetailsX = margin;
  let companyDetailsY = yPosition;
  
  doc.setFont('helvetica', 'normal');
  doc.text('EzeeRoom', companyDetailsX, companyDetailsY);
  companyDetailsY += 6;
  doc.text('Thimphu, Bhutan', companyDetailsX, companyDetailsY);
  companyDetailsY += 6;
  doc.text('Email: choegyell@gmail.com', companyDetailsX, companyDetailsY);
  companyDetailsY += 6;
  doc.text('Email: zepadorji222@gmail.com', companyDetailsX, companyDetailsY);
  companyDetailsY += 6;
  doc.text('Phone: +97577965452, +97577236000', companyDetailsX, companyDetailsY);
  companyDetailsY += 6;
  doc.text('Website: www.ezeeroom.bt', companyDetailsX, companyDetailsY);
  companyDetailsY += 10;

  // Business Registration & Tax Information
  doc.setFont('helvetica', 'bold');
  doc.text('Business Registration:', companyDetailsX, companyDetailsY);
  companyDetailsY += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('Registered in Bhutan', companyDetailsX, companyDetailsY);
  companyDetailsY += 6;
  doc.text('Tax ID: As per Bhutan Revenue & Customs', companyDetailsX, companyDetailsY);
  companyDetailsY += 10;

  // Seal/Logo (Right side) - Load and add image (stretched horizontally)
  const sealHeight = 30;
  const sealWidth = 40; // Stretched in x direction (1.33x wider)
  const sealX = pageWidth - margin - sealWidth;
  const sealY = yPosition;
  
  // Try to load and add seal image
  try {
    const sealImageData = await loadImageAsBase64('/images/seal.jpeg');
    doc.addImage(sealImageData, 'JPEG', sealX, sealY, sealWidth, sealHeight);
  } catch (error) {
    // If image fails to load, add a placeholder
    console.warn('Seal image could not be loaded, using placeholder:', error);
    doc.setFillColor(240, 240, 240);
    doc.rect(sealX, sealY, sealWidth, sealHeight, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Seal', sealX + sealWidth / 2, sealY + sealHeight / 2, { align: 'center' });
  }

  // Authorized Signature Section (Right side, below seal)
  let signatureY = sealY + sealHeight + 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Seal', sealX + sealWidth / 2, signatureY, { align: 'center' });
  signatureY += 15;
  
  yPosition = Math.max(companyDetailsY, signatureY) + 20;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Save the PDF
  const fileReceiptNumber = receiptData.receiptNumber || 'N/A';
  const fileDate = invoiceDate.replace(/[,\s]/g, '-').replace(/(st|nd|rd|th)/g, '');
  const fileName = `${isBooking ? 'booking' : 'subscription'}-receipt-${fileReceiptNumber}-${fileDate}.pdf`;
  doc.save(fileName);
};
