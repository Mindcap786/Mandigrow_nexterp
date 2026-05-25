### RCA for "Purchase Bill showing To Pay despite Payment/Cleared Cheque"

**What happened:**
When you clicked "Settlement" on a specific inward bill, the frontend opened the Payment Dialog. However, due to a missing mapping in the frontend code, it did **not** pass the specific `arrival_id` (the bill ID) to the backend's `create_voucher` function. 

As a result, the payment (or cheque) was recorded in the ledger as a **Generic / Unlinked Payment** for that supplier, rather than being explicitly tagged to that specific bill (`against_voucher` was blank).

**Why it still showed "To Pay":**
Because the payment was untagged, the system's ledger calculation (`_get_ledger_summary`) used its fallback **FIFO (First-In-First-Out) logic**. 
FIFO automatically takes any unlinked payments and applies them to the **oldest unpaid bills** first. 
Since this supplier likely had older pending bills, the payment was absorbed by those older bills in the background. The newer bill you intended to pay didn't get any allocation from the payment, so it correctly (according to FIFO) remained in "To Pay" status.

The exact same thing happened with the cleared cheque for the other user. Even though the cheque cleared, it was still an untagged payment, so the global FIFO pool absorbed it for older dues.

**The Fix (Already Applied):**
I have updated `NewPaymentDialog.tsx` to correctly extract and pass the `arrival_id` and `lot_id` to the backend. 
Now, when you click Settlement on a specific inward, the resulting payment/cheque will be explicitly tagged with `against_voucher = [Bill ID]`. The ledger will prioritize this explicit link over FIFO, guaranteeing that the specific bill immediately updates to "Paid".

---
### RCA for "Two entries in the third screenshot"

Without seeing the screenshot, there are two common scenarios that cause "two entries" to appear:

1. **Grouped Inwards by Bill Number**: 
   In the Supplier Inwards Dialog, the system groups lots by the `contact_bill_no` or `reference_no`. If two separate `Mandi Arrival` entries were accidentally created with the exact same Bill Number for that supplier, the dialog will group them together into a single block with multiple products inside it.

2. **Ledger Double-Entry System**:
   If the screenshot is from the Ledger Statement, remember that Frappe uses double-entry accounting. A single Payment Journal Entry will create two `GL Entry` rows:
   - One row debiting the Supplier (Creditors).
   - One row crediting the Bank / Cash.
   This is standard accounting, not a duplicate.

If the entries were duplicated in the Payment dialog (like two Journal Entries created at the same time), this typically happens if the "Submit" button was clicked twice rapidly before the loading state disabled it. The system has idempotency guards for automated ledgers, but manual manual entry dialogs can sometimes be double-clicked. 
