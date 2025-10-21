const PDFDocument = require('pdfkit');
const json2xls = require('json2xls');
const { Parser } = require('json2csv');

class JasperReportService {
    
    // Generate PDF Report for PQ Data
    async generatePQPDF(data, parameters) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ 
                    margin: 50,
                    size: 'A4',
                    info: {
                        Title: 'Purchase Quotation Report',
                        Author: 'Your Company',
                        Subject: 'PQ Report'
                    }
                });
                
                const chunks = [];
                
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Add content to PDF
                this.addPQPDFContent(doc, data, parameters);
                doc.end();
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // Add PQ specific content to PDF
    addPQPDFContent(doc, data, parameters) {
        const { start_date, end_date } = parameters;

        // Header Section
        this.addHeader(doc, start_date, end_date);
        
        // Table Section
        this.addPQTable(doc, data);
        
        // Footer Section
        this.addFooter(doc, data);
    }

    // Add Header
    addHeader(doc, start_date, end_date) {
        // Company Logo & Title
        doc.fillColor('#333333')
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('PURCHASE QUOTATION REPORT', { align: 'center' });
        
        doc.moveDown(0.5);
        doc.fontSize(12)
           .font('Helvetica')
           .text(`Report Period: ${start_date} to ${end_date}`, { align: 'center' });
        
        doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(1.5);
        
        // Add a line separator
        doc.moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .strokeColor('#cccccc')
           .lineWidth(1)
           .stroke();
        
        doc.moveDown(1);
    }

    // Add PQ Table
    addPQTable(doc, data) {
        const tableTop = doc.y;
        
        // Table Headers
        const headers = [
            { text: '#', width: 30 },
            { text: 'PQ ID', width: 50 },
            { text: 'Date', width: 70 },
            { text: 'Customer Name', width: 120 },
            { text: 'Product Name', width: 100 },
            { text: 'Qty', width: 40 },
            { text: 'Price', width: 60 },
            { text: 'Total', width: 60 }
        ];
        
        // Draw header background
        doc.rect(50, tableTop, 455, 25)
           .fillColor('#f8f9fa')
           .fill();
        
        // Header text
        let x = 50;
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .fillColor('#333333');
        
        headers.forEach(header => {
            doc.text(header.text, x + 5, tableTop + 8, {
                width: header.width - 10,
                align: header.text === 'Qty' || header.text === 'Price' || header.text === 'Total' ? 'right' : 'left'
            });
            x += header.width;
        });

        // Table rows
        doc.font('Helvetica')
           .fontSize(9)
           .fillColor('#333333');
        
        let y = tableTop + 30;
        let grandTotal = 0;

        data.forEach((item, index) => {
            // Alternate row background
            if (index % 2 === 0) {
                doc.rect(50, y - 5, 455, 20)
                   .fillColor('#f8f9fa')
                   .fill();
            }

            x = 50;
            const rowData = [
                { text: (index + 1).toString(), width: 30, align: 'center' },
                { text: item.pq_id.toString(), width: 50, align: 'center' },
                { text: new Date(item.pq_date).toLocaleDateString(), width: 70, align: 'center' },
                { text: item.customer_name, width: 120, align: 'left' },
                { text: item.product_name, width: 100, align: 'left' },
                { text: item.quantity.toString(), width: 40, align: 'right' },
                { text: `$${Number(item.price).toFixed(2)}`, width: 60, align: 'right' },
                { text: `$${Number(item.total_amount || (item.quantity * item.price)).toFixed(2)}`, width: 60, align: 'right' }
            ];

            rowData.forEach(cell => {
                doc.text(cell.text, x + 5, y, {
                    width: cell.width - 10,
                    align: cell.align
                });
                x += cell.width;
            });

            grandTotal += item.total_amount || (item.quantity * item.price);
            y += 20;

            // Check for page break
            if (y > 700) {
                doc.addPage();
                this.addHeader(doc, parameters.start_date, parameters.end_date);
                y = doc.y + 30;
                
                // Redraw headers on new page
                x = 50;
                doc.rect(50, y - 25, 455, 25)
                   .fillColor('#f8f9fa')
                   .fill();
                
                headers.forEach(header => {
                    doc.font('Helvetica-Bold')
                       .fontSize(10)
                       .text(header.text, x + 5, y - 17, {
                           width: header.width - 10,
                           align: header.text === 'Qty' || header.text === 'Price' || header.text === 'Total' ? 'right' : 'left'
                       });
                    x += header.width;
                });
                
                y += 30;
            }
        });

        // Grand Total row
        y += 10;
        doc.rect(350, y - 5, 155, 25)
           .fillColor('#e9ecef')
           .fill();
        
        doc.font('Helvetica-Bold')
           .fontSize(11)
           .text('Grand Total:', 360, y + 5, { width: 80, align: 'left' })
           .text(`$${grandTotal.toFixed(2)}`, 440, y + 5, { width: 60, align: 'right' });
    }

    // Add Footer
    addFooter(doc, data) {
        doc.moveDown(2);
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666666')
           .text(`Total Records: ${data.length}`, { align: 'center' })
           .text('This is a computer generated report.', { align: 'center' });
    }

    // Generate Excel Report
    generatePQExcel(data) {
        const excelData = data.map(item => ({
            'PQ ID': item.pq_id,
            'PQ Date': new Date(item.pq_date).toLocaleDateString('en-US'),
            'Customer Name': item.customer_name,
            'Product Name': item.product_name,
            'Quantity': item.quantity,
            'Unit Price': Number(item.price).toFixed(2),
            'Total Amount': Number(item.total_amount || (item.quantity * item.price)).toFixed(2),
            'Created Date': new Date(item.created_at).toLocaleDateString('en-US')
        }));

        return json2xls(excelData);
    }

    // Generate CSV Report
    generatePQCSV(data) {
        const fields = [
            { label: 'PQ ID', value: 'pq_id' },
            { label: 'PQ Date', value: row => new Date(row.pq_date).toLocaleDateString('en-US') },
            { label: 'Customer Name', value: 'customer_name' },
            { label: 'Product Name', value: 'product_name' },
            { label: 'Quantity', value: 'quantity' },
            { label: 'Unit Price', value: 'price' },
            { label: 'Total Amount', value: row => row.total_amount || (row.quantity * row.price) }
        ];
        
        const parser = new Parser({ fields, withBOM: true });
        return parser.parse(data);
    }
}

module.exports = JasperReportService;