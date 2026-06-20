import frappe

def run():
    print("Setting up L10n tables...")
    
    # 1. Mandi Translation Cache
    frappe.db.sql("""
    CREATE TABLE IF NOT EXISTS `tabMandi Translation Cache` (
        `name` varchar(140) NOT NULL,
        `creation` datetime(6) DEFAULT NULL,
        `modified` datetime(6) DEFAULT NULL,
        `modified_by` varchar(140) DEFAULT NULL,
        `owner` varchar(140) DEFAULT NULL,
        `docstatus` int(1) NOT NULL DEFAULT '0',
        `parent` varchar(140) DEFAULT NULL,
        `parentfield` varchar(140) DEFAULT NULL,
        `parenttype` varchar(140) DEFAULT NULL,
        `idx` int(8) NOT NULL DEFAULT '0',
        `source_text` varchar(140) DEFAULT NULL,
        `language` varchar(140) DEFAULT NULL,
        `translated_text` varchar(140) DEFAULT NULL,
        PRIMARY KEY (`name`),
        KEY `source_lang` (`source_text`, `language`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)
    
    # 2. Add local_name to Mandi Contact
    try:
        frappe.db.sql("ALTER TABLE `tabMandi Contact` ADD COLUMN `local_name` varchar(140) DEFAULT NULL")
        print("Added local_name to tabMandi Contact")
    except Exception as e:
        pass # Already exists
        
    # 3. Add local_name to Mandi Item Override
    try:
        frappe.db.sql("ALTER TABLE `tabMandi Item Override` ADD COLUMN `local_name` varchar(140) DEFAULT NULL")
        print("Added local_name to tabMandi Item Override")
    except Exception as e:
        pass # Already exists

    frappe.db.commit()
    print("Done!")
