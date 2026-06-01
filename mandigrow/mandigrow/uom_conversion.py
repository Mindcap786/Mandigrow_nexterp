import frappe
from frappe.utils import flt

def get_kg_equivalent(qty, unit_weight):
    """
    Calculate the total kg equivalent given quantity and unit_weight.
    E.g. 85 Boxes * 10 kg/Box = 850 kg.
    """
    if flt(unit_weight) > 0:
        return flt(qty) * flt(unit_weight)
    return flt(qty)

def get_rate_per_kg(rate, unit_weight):
    """
    Calculate the rate per kg given the per-unit rate and unit_weight.
    E.g. ₹200 / Box with 10 kg/Box = ₹20 / kg.
    """
    if flt(unit_weight) > 0:
        return flt(rate) / flt(unit_weight)
    return flt(rate)

def convert_kg_to_boxes(kg_qty, unit_weight):
    """
    Convert a KG quantity back to boxes. Returns tuple of (boxes, remaining_kg).
    E.g. 25 kg / 10 kg/Box = 2.5 boxes -> (2.5, 0)
    For strict physical boxes, this might need rounding/math.floor based on business rules.
    Here we assume fractional boxes are allowed in system calculations.
    """
    if flt(unit_weight) > 0:
        return flt(kg_qty) / flt(unit_weight)
    return flt(kg_qty)
