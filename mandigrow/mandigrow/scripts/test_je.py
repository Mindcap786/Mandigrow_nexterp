import frappe
def execute():
    from erpnext.accounts.doctype.journal_entry.journal_entry import JournalEntry
    import inspect
    print("clear_bank_account_for_payment" in dir(JournalEntry))
    print(inspect.getsource(JournalEntry.before_save))
