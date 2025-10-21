const JasperReportService = require('../service/jasperReportService');
const DBCRUDService = require('../service/DBCRUDService');
const ResponseHandler = require('../utils/responseHandler');

const pqService = new DBCRUDService('public', 'proc_pq_crud');
const jasperService = new JasperReportService(); // JasperReportService instance

// Generate PQ Report
exports.generatePQReport = async (req, res) => {
    try {
        const { start_date, end_date, format = 'pdf' } = req.body;
        
        // Validate required fields
        if (!start_date || !end_date) {
            return ResponseHandler.error(res, 'start_date and end_date are required');
        }

        // Validate format
        const validFormats = ['pdf', 'xlsx', 'csv'];
        if (!validFormats.includes(format.toLowerCase())) {
            return ResponseHandler.error(res, 'Invalid format. Use pdf, xlsx, or csv');
        }

        console.log('Generating PQ report with JasperReportService:', { start_date, end_date, format });

        // Get data from stored procedure
        const result = await pqService.getList({ start_date, end_date });
        
        console.log('Database result:', result);
        
        if (!result.success) {
            return ResponseHandler.error(res, result.msg);
        }

        const data = result.data || [];

        if (data.length === 0) {
            return ResponseHandler.error(res, 'No PQ data found for the given date range');
        }

        const parameters = { start_date, end_date };
        let fileBuffer;
        let contentType;
        let fileName;
        let disposition;

        // Generate report based on format
        switch (format.toLowerCase()) {
            case 'pdf':
                fileBuffer = await jasperService.generatePQPDF(data, parameters);
                contentType = 'application/pdf';
                fileName = `PQ_Report_${start_date}_to_${end_date}.pdf`;
                disposition = 'inline'; // PDF Preview
                break;

            case 'xlsx':
                fileBuffer = jasperService.generatePQExcel(data);
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                fileName = `PQ_Report_${start_date}_to_${end_date}.xlsx`;
                disposition = 'attachment'; // Excel Download
                break;

            case 'csv':
                fileBuffer = jasperService.generatePQCSV(data);
                contentType = 'text/csv; charset=utf-8';
                fileName = `PQ_Report_${start_date}_to_${end_date}.csv`;
                disposition = 'attachment'; // CSV Download
                break;
        }

        // Set response headers
        res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
        res.setHeader('Content-Type', contentType);
        
        // For CSV, add BOM for Excel compatibility
        if (format.toLowerCase() === 'csv') {
            res.send('\uFEFF' + fileBuffer);
        } else {
            res.send(fileBuffer);
        }

        console.log(`Report generated successfully by JasperReportService: ${fileName}`);

    } catch (err) {
        console.error('JasperReportService Error:', err);
        ResponseHandler.error(res, err.message);
    }
};