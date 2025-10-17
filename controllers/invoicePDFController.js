const fs = require('fs');
const path = require('path');
const jsreport = require('../service/jsreportServer');
const DBCRUDService = require('../service/DBCRUDService');
const ResponseHandler = require('../utils/responseHandler');

// Stored procedure service
const invoiceService = new DBCRUDService('public', 'proc_invoice_crud');

exports.generateInvoicePDF = async (req, res) => {
    const invoice_id = req.body.id;

    try {
        const invoiceData = await invoiceService.getById({
            action_mode: 'getById',
            invoice_id
        });

        if (!invoiceData.data || invoiceData.data.length === 0) {
            return ResponseHandler.error(res, 'Invoice not found');
        }

        const invoice = invoiceData.data[0];

        const templatePath = path.join(__dirname, '../templates/invoice/invoiceTemplate.html');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');

        // Initialize jsreport only once
        if (!jsreport._initialized) {
            await jsreport.init();
            jsreport._initialized = true;
        }

        const report = await jsreport.render({
            template: {
                content: templateContent,
                engine: 'handlebars',
                recipe: 'chrome-pdf'
            },
            data: { invoice }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice_id}.pdf`);
        report.stream.pipe(res);

    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};
