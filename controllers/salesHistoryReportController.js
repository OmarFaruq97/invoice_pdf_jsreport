//controllers/salesHistoryReportController.js
/*
const fs = require('fs');
const path = require('path');
const jsreport = require('../service/jsreportServer');
const DBCRUDService = require('../service/DBCRUDService');
const ResponseHandler = require('../utils/responseHandler');
const json2xls = require('json2xls');
const { Parser } = require('json2csv');

const salesService = new DBCRUDService('public', 'proc_sales_history_crud');

// PDF Report (unchanged)
exports.generatePDFReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.body;
        const result = await salesService.getList({ action_mode: 'getList', start_date, end_date });
        const data = result.data || [];

        const templatePath = path.join(__dirname, '../templates/salesHistoryReport/salesHistoryReport.html');
        const templateContent = fs.readFileSync(templatePath, 'utf8');

        const reportData = { start_date, end_date, sales: data };

        const resp = await jsreport.render({
            template: { content: templateContent, engine: 'handlebars', recipe: 'chrome-pdf' },
            data: reportData
        });

        const fileName = `SalesHistory_${Date.now()}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-type', 'application/pdf');
        resp.stream.pipe(res);

    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

// XLS Report (stream directly, no temp file)
exports.generateXLSReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.body;
        const result = await salesService.getList({ action_mode: 'getList', start_date, end_date });
        const data = result.data || [];

        const xlsData = json2xls(data);

        const fileName = `SalesHistory_${Date.now()}.xlsx`;
        res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(xlsData);

    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

// CSV Report (stream directly)
exports.generateCSVReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.body;
        const result = await salesService.getList({ action_mode: 'getList', start_date, end_date });
        const data = result.data || [];

        const csvData = new Parser().parse(data);

        const fileName = `SalesHistory_${Date.now()}.csv`;
        res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-type', 'text/csv');
        res.send(csvData);

    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};
*/
const fs = require('fs');
const path = require('path');
const jsreport = require('../service/jsreportServer');
const DBCRUDService = require('../service/DBCRUDService');
const ResponseHandler = require('../utils/responseHandler');
const json2xls = require('json2xls');
const { Parser } = require('json2csv');
const Handlebars = require('handlebars');

// Register Handlebars helpers
Handlebars.registerHelper('formatDate', function(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
});

Handlebars.registerHelper('addOne', function(index) {
  return index + 1;
});

const salesService = new DBCRUDService('public', 'proc_sales_history_crud');

// Consolidated report generator
exports.generateReport = async (req, res) => {
    try {
        const { start_date, end_date, format = 'pdf' } = req.body;
        
        // Validate required fields
        if (!start_date || !end_date) {
            return ResponseHandler.error(res, 'start_date and end_date are required');
        }

        // Validate format
        const validFormats = ['pdf', 'csv', 'xls'];
        if (!validFormats.includes(format.toLowerCase())) {
            return ResponseHandler.error(res, 'Invalid format. Use pdf, csv, or xls');
        }

        console.log('Generating report with params:', { start_date, end_date, format });

        // Get data from stored procedure
        const result = await salesService.getList({ start_date, end_date });
        
        console.log('Data from DB:', result);
        
        if (!result.success) {
            return ResponseHandler.error(res, result.msg);
        }

        const data = result.data || [];

        if (data.length === 0) {
            return ResponseHandler.error(res, 'No data found for the given date range');
        }

        // Generate report based on format
        switch (format.toLowerCase()) {
            case 'pdf':
                await generatePDF(res, data, start_date, end_date);
                break;
            case 'csv':
                generateCSV(res, data, start_date, end_date);
                break;
            case 'xls':
                generateXLS(res, data, start_date, end_date);
                break;
        }

    } catch (err) {
        console.error('Report Generation Error:', err);
        ResponseHandler.error(res, err.message);
    }
};

// PDF Generator
async function generatePDF(res, data, start_date, end_date) {
    try {
        const templatePath = path.join(__dirname, '../templates/salesHistoryReport/salesHistoryReport.html');
        
        if (!fs.existsSync(templatePath)) {
            throw new Error('PDF template not found');
        }

        const templateContent = fs.readFileSync(templatePath, 'utf8');

        // Pre-process data for PDF (format dates)
        const processedData = data.map(item => ({
            ...item,
            sale_date: new Date(item.sale_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        }));

        const reportData = { 
            start_date: start_date, 
            end_date: end_date, 
            sales: processedData,
            generated_at: new Date().toLocaleString()
        };

        console.log('Generating PDF with data count:', processedData.length);

        const resp = await jsreport.render({
            template: { 
                content: templateContent, 
                engine: 'handlebars', 
                recipe: 'chrome-pdf',
                chrome: {
                    landscape: false,
                    format: 'A4',
                    marginTop: '1cm',
                    marginBottom: '1cm',
                    marginLeft: '1cm',
                    marginRight: '1cm'
                }
            },
            data: reportData
        });

        const fileName = `SalesHistory_${start_date}_to_${end_date}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');
        resp.stream.pipe(res);

    } catch (err) {
        throw new Error(`PDF generation failed: ${err.message}`);
    }
}

// CSV Generator
function generateCSV(res, data, start_date, end_date) {
    try {
        // Format dates for CSV
        const csvData = data.map(item => ({
            ...item,
            sale_date: new Date(item.sale_date).toLocaleDateString('en-US')
        }));

        const fields = [
            { label: 'Sale ID', value: 'sale_id' },
            { label: 'Product Name', value: 'product_name' },
            { label: 'Customer ID', value: 'customer_id' },
            { label: 'Quantity', value: 'quantity' },
            { label: 'Price', value: 'price' },
            { label: 'Total Amount', value: 'total_amount' },
            { label: 'Sale Date', value: 'sale_date' },
            { label: 'Payment Method', value: 'payment_method' }
        ];
        
        const csvParser = new Parser({ 
            fields,
            withBOM: true
        });
        
        const csvContent = csvParser.parse(csvData);

        const fileName = `SalesHistory_${start_date}_to_${end_date}.csv`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.send('\uFEFF' + csvContent);

    } catch (err) {
        throw new Error(`CSV generation failed: ${err.message}`);
    }
}

// XLS Generator
function generateXLS(res, data, start_date, end_date) {
    try {
        // Prepare data for Excel
        const excelData = data.map(item => ({
            'Sale ID': item.sale_id,
            'Product Name': item.product_name,
            'Customer ID': item.customer_id,
            'Quantity': item.quantity,
            'Price': item.price,
            'Total Amount': item.total_amount,
            'Sale Date': new Date(item.sale_date).toLocaleDateString(),
            'Payment Method': item.payment_method
        }));

        const xlsData = json2xls(excelData);

        const fileName = `SalesHistory_${start_date}_to_${end_date}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(xlsData);

    } catch (err) {
        throw new Error(`XLS generation failed: ${err.message}`);
    }
}