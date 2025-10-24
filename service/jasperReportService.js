const PDFDocument = require('pdfkit');
const json2xls = require('json2xls');
const { Parser } = require('json2csv');

class JasperReportService {

    // Generate PDF Report
    async generatePQPDF(data, parameters) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                this.generatePDFFromTemplate(doc, data, parameters);
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Generate PDF (normal simple look)
    generatePDFFromTemplate(doc, data, parameters) {
        const { start_date, end_date } = parameters;

        const processedData = data.map((item, i) => ({
            serial: i + 1,
            pq_id: item.pq_id || 'N/A',
            pq_date: item.pq_date ? new Date(item.pq_date).toLocaleDateString() : 'N/A',
            customer_name: item.customer_name || 'N/A',
            product_name: item.product_name || 'N/A',
            quantity: item.quantity || 0,
            price: Number(item.price || 0).toFixed(2),
            total_amount: Number(item.total_amount || (item.quantity * item.price) || 0).toFixed(2)
        }));

        const grandTotal = processedData.reduce((sum, item) => sum + Number(item.total_amount), 0);
        const totalRecords = processedData.length;

        this.addHeader(doc, start_date, end_date);
        this.addTable(doc, processedData, grandTotal, totalRecords);
        this.addFooter(doc);
    }

    // Header (Simple)
    addHeader(doc, start_date, end_date) {
    // Main Title
    doc.font('Helvetica-Bold')
        .fontSize(18)
        .fillColor('#2c3e50')
        .text('PURCHASE QUOTATION REPORT', { align: 'center' });

    doc.moveDown(0.5);
    
    // ✅ Perfectly aligned in one row with proper spacing
    const currentY = doc.y;
    
    // From Date - Left
    doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#34495e')
        .text(`From: ${start_date}`, 50, currentY);
    
    // To Date - Center  
    doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#34495e')
        .text(`To: ${end_date}`, 0, currentY, { align: 'center' });
    
    // Generated Date - Right
    doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#34495e')
        .text(`Generated: ${new Date().toLocaleString()}`, 0, currentY, { align: 'right' });

    doc.y = currentY + 15;
    
    doc.moveDown(0.5);
    
    // Separator line
    doc.moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor('#bdc3c7')
        .lineWidth(1)
        .stroke();
    
    doc.moveDown(1);
}

    // Table (No color — light gray rows only)
    addTable(doc, data, grandTotal, totalRecords) {
        const startX = 50;
        let y = doc.y;

        const headers = ['#', 'PQ ID', 'Date', 'Customer', 'Product', 'Qty', 'Price', 'Total'];
        const colWidths = [25, 40, 60, 100, 100, 40, 60, 70];
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);

        // Header row
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#000');
        let x = startX;
        headers.forEach((h, i) => {
            doc.text(h, x + 5, y, { width: colWidths[i] - 10, align: 'center' });
            x += colWidths[i];
        });

        y += 15;
        doc.moveTo(startX, y).lineTo(startX + tableWidth, y).strokeColor('#000').stroke();

        // Data rows
        doc.font('Helvetica').fontSize(9).fillColor('#000');
        data.forEach((row, i) => {
            if (i % 2 === 0) {
                doc.rect(startX, y + 2, tableWidth, 14)
                    .fillColor('#f2f2f2')
                    .fill();
            }

            const cells = [
                row.serial,
                row.pq_id,
                row.pq_date,
                row.customer_name,
                row.product_name,
                row.quantity,
                `$${row.price}`,
                `$${row.total_amount}`
            ];

            x = startX;
            cells.forEach((c, idx) => {
                doc.fillColor('#000')
                    .text(c.toString(), x + 5, y + 4, {
                        width: colWidths[idx] - 10,
                        align: idx >= 5 ? 'right' : 'left'
                    });
                x += colWidths[idx];
            });

            y += 18;
        });

        // Grand total row
        y += 10;
        doc.font('Helvetica-Bold')
            .fillColor('#000')
            .text('Grand Total:', 360, y, { width: 80 })
            .text(`$${grandTotal.toFixed(2)}`, 440, y, { width: 80, align: 'right' });

        // Total records
        y += 20;
        doc.font('Helvetica')
            .fillColor('#000')
            .text(`Total Records: ${totalRecords}`, { align: 'center' });
    }

    // Footer
    addFooter(doc) {
        doc.moveDown(2);
        doc.fontSize(10)
            .fillColor('#555')
            .text('This is a computer generated report', { align: 'center' });
    }

    // Excel
    generatePQExcel(data) {
        const excelData = data.map(item => ({
            'PQ ID': item.pq_id,
            'PQ Date': new Date(item.pq_date).toLocaleDateString('en-US'),
            'Customer Name': item.customer_name,
            'Product Name': item.product_name,
            'Quantity': item.quantity,
            'Unit Price': Number(item.price).toFixed(2),
            'Total Amount': Number(item.total_amount || (item.quantity * item.price)).toFixed(2)
        }));
        return json2xls(excelData);
    }

    // CSV
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
