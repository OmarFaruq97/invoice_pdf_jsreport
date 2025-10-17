const jsreport = require('jsreport-core')();

jsreport.use(require('jsreport-handlebars')());
jsreport.use(require('jsreport-pdf-utils')());
jsreport.use(require('jsreport-chrome-pdf')());

jsreport.init().then(() =>
    console.log('jsreport initialized')).
    catch(e => console.error(e));

module.exports = jsreport;
