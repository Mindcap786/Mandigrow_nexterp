import openpyxl
from openpyxl.worksheet.datavalidation import DataValidation

# Load the workbook and select the active worksheet
wb = openpyxl.load_workbook('next_app/public/templates/contact_import_template.xlsx')
ws = wb.active

# Find the existing data validation for Partner Type and update it
found_dv = None
for dv in ws.data_validations.dataValidation:
    if dv.sqref and "B2:B1000" in str(dv.sqref):
        found_dv = dv
        break

if found_dv:
    # Update the formula to include Supplier instead of Commission Agent
    found_dv.formula1 = '"Farmer,Buyer,Supplier"'
else:
    # If not found, create a new one
    dv_partner = DataValidation(type="list", formula1='"Farmer,Buyer,Supplier"', allow_blank=True)
    dv_partner.error = 'Your entry is not in the list'
    dv_partner.errorTitle = 'Invalid Entry'
    dv_partner.prompt = 'Please select from the list'
    dv_partner.promptTitle = 'Select Partner Type'
    ws.add_data_validation(dv_partner)
    dv_partner.add('B2:B1000')

# Save the updated workbook
wb.save('next_app/public/templates/contact_import_template.xlsx')
print("Updated Excel template with Supplier instead of Commission Agent.")
