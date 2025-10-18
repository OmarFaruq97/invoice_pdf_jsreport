// const fs = require('fs').promises; // Use promise-based FS
// const path = require('path');
// const jsreport = require('../service/jsreportServer');
// const DBCRUDService = require('../service/DBCRUDService');
// const ResponseHandler = require('../utils/responseHandler');
// const json2xls = require('json2xls');
// const { Parser } = require('json2csv');

// const salesService = new DBCRUDService('public', 'proc_sales_history_crud');

// // Supported formats for validation
// const SUPPORTED_FORMATS = ['pdf', 'xls', 'csv'];

// exports.generateReport = async (req, res) => {
//     try {
//         const { start_date, end_date, format = 'pdf' } = req.body;

//         // Input validation
//         if (!start_date || !end_date) {
//             return ResponseHandler.error(res, 'Start date and end date are required', 400);
//         }

//         if (!SUPPORTED_FORMATS.includes(format)) {
//             return ResponseHandler.error(res, `Unsupported format. Supported: ${SUPPORTED_FORMATS.join(', ')}`, 400);
//         }

//         const spParams = {
//             action_mode: 'getList',
//             start_date,
//             end_date
//         };

//         const result = await salesService.getList(spParams);
//         const data = result.data || [];

//         // Check if data is available
//         if (data.length === 0) {
//             return ResponseHandler.error(res, 'No data found for the specified date range', 404);
//         }

//         const timestamp = Date.now();
        
//         switch (format) {
//             case 'pdf':
//                 await generatePDFReport(res, data, start_date, end_date, timestamp);
//                 break;
                
//             case 'xls':
//                 await generateXLSReport(res, data, timestamp);
//                 break;
                
//             case 'csv':
//                 await generateCSVReport(res, data, timestamp);
//                 break;
//         }

//     } catch (err) {
//         console.error('Report generation error:', err);
//         ResponseHandler.error(res, err.message);
//     }
// };

// // PDF Generation Function
// async function generatePDFReport(res, data, startDate, endDate, timestamp) {
//     try {
//         const templatePath = path.join(__dirname, '../templates/salesHistoryReport/salesHistoryReport.html');
//         const templateContent = await fs.readFile(templatePath, 'utf8');
        
//         const reportData = { 
//             start_date: startDate, 
//             end_date: endDate, 
//             sales: data,
//             generated_at: new Date().toLocaleString()
//         };

//         const resp = await jsreport.render({
//             template: {
//                 content: templateContent,
//                 engine: 'handlebars',
//                 recipe: 'chrome-pdf'
//             },
//             data: reportData
//         });

//         const fileName = `SalesHistory_${timestamp}.pdf`;
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//         res.setHeader('Content-Type', 'application/pdf');
        
//         resp.stream.pipe(res);

//     } catch (error) {
//         throw new Error(`PDF generation failed: ${error.message}`);
//     }
// }

// // XLS Generation Function
// async function generateXLSReport(res, data, timestamp) {
//     try {
//         const xlsData = json2xls(data);
//         const fileName = `SalesHistory_${timestamp}.xlsx`;
        
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.send(xlsData);

//     } catch (error) {
//         throw new Error(`XLS generation failed: ${error.message}`);
//     }
// }

// // CSV Generation Function
// async function generateCSVReport(res, data, timestamp) {
//     try {
//         // Customize CSV fields if needed
//         const fields = Object.keys(data[0] || {});
//         const parser = new Parser({ fields });
//         const csv = parser.parse(data);
        
//         const fileName = `SalesHistory_${timestamp}.csv`;
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//         res.setHeader('Content-Type', 'text/csv; charset=utf-8');
//         res.send('\uFEFF' + csv); // BOM for Excel compatibility

//     } catch (error) {
//         throw new Error(`CSV generation failed: ${error.message}`);
//     }
// }


const fs = require('fs');
const path = require('path');
const jsreport = require('../service/jsreportServer');
const DBCRUDService = require('../service/DBCRUDService');
const ResponseHandler = require('../utils/responseHandler');
const json2xls = require('json2xls');

// Stored procedure service
const salesService = new DBCRUDService('public', 'proc_sales_history_crud');

exports.generateReport = async (req, res) => {
    try {
        const { start_date, end_date, format } = req.body;

        // Call SP with filter params
        const spParams = {
            action_mode: 'getList',
            start_date,
            end_date
        };
        const result = await salesService.getList(spParams);
        const data = result.data || [];

        if (format === 'pdf') {
            // Read HTML template
            const templatePath = path.join(__dirname, '../templates/salesHistoryReport/salesHistoryReport.html');
            const templateContent = fs.readFileSync(templatePath, 'utf8');

            // Prepare data for template
            const reportData = { start_date, end_date, sales: data };

            // Generate PDF via JSReport
            const resp = await jsreport.render({
                template: {
                    content: templateContent,
                    engine: 'handlebars',
                    recipe: 'chrome-pdf'
                },
                data: reportData
            });

            const fileName = `SalesHistory_${Date.now()}.pdf`;
            res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-type', 'application/pdf');
            resp.stream.pipe(res);

        } else if (format === 'xls' || format === 'csv') {
            const xlsData = json2xls(data);
            const fileName = `SalesHistory_${Date.now()}.${format === 'xls' ? 'xlsx' : 'csv'}`;
            const filePath = path.join(__dirname, fileName);

            fs.writeFileSync(filePath, xlsData);

            res.download(filePath, fileName, (err) => {
                fs.unlinkSync(filePath);
                if (err) console.error(err);
            });

        } else {
            res.status(400).json({ success: false, msg: 'Invalid format' });
        }

    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};
