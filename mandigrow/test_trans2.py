from mandigrow.local_invoices.translator import translate_batch
def run():
    res = translate_batch(["A1 Traders"], "te")
    print("BATCH_PARTY:", res)
