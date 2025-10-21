//controllers/salesHistoryReportController.js

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


/* 
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
*/