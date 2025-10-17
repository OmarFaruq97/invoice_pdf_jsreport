const jsreport = require('jsreport-core')();

jsreport.use(require('jsreport-handlebars')());
jsreport.use(require('jsreport-pdf-utils')());

module.exports = jsreport;
