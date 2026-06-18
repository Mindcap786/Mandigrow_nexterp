const XLSX = require('xlsx');

// Load the existing workbook
const workbook = XLSX.readFile('public/templates/contact_import_template.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Update the data validation rules in the worksheet
if (worksheet['!dataValidation']) {
    worksheet['!dataValidation'].forEach(dv => {
        if (dv.sqref && dv.sqref.includes('B2:B1000')) {
            // Update the formula for Partner Type
            dv.formula1 = '"Farmer,Buyer,Supplier"';
        }
    });
}

// Write it back to the file
XLSX.writeFile(workbook, 'public/templates/contact_import_template.xlsx');
console.log('Updated template to use Supplier instead of Commission Agent');
