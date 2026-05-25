"use client";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/routes";

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const currentTab = pathname.includes("buyer-collections") ? "buyer-collections" :
                       pathname.includes("expense-recovery") ? "expense-recovery" : "gst";

    return (
        <div className="w-full flex flex-col">
            <div className="px-6 md:px-10 pt-8 pb-0">
                <Tabs value={currentTab} onValueChange={(val) => {
                    if (val === "gst") router.push(ROUTES.REPORT_GST);
                    if (val === "buyer-collections") router.push(ROUTES.REPORT_BUYER_COLLECTIONS);
                    if (val === "expense-recovery") router.push(ROUTES.REPORT_EXPENSE_RECOVERY);
                }} className="w-full">
                    <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-auto flex flex-wrap gap-1 w-fit">
                        <TabsTrigger value="gst" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 transition-all">
                            GST Compliance
                        </TabsTrigger>
                        <TabsTrigger value="buyer-collections" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 transition-all">
                            Buyer Collections
                        </TabsTrigger>
                        <TabsTrigger value="expense-recovery" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 transition-all">
                            3rd Party Expenses
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            {/* The child pages (gst, buyer-collections, expense-recovery) already have their own p-6/p-10 wrappers, 
                so we don't add extra padding here to avoid double padding. */}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
