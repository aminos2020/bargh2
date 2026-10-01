import { WorkReport } from "@/models/work-report";
import { ReportItem } from "@/models/report-item";
import { Company } from "@/models/company";
import { Contract } from "@/models/contract";
import { WorkGroup } from "@/models/work-group";
import { jalaliKey, toJalali } from "@/lib/date";

function daysBack(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(jalaliKey(toJalali(d)));
  }
  return out;
}

export async function deputyAnalytics(rangeDays = 14) {
  const days = daysBack(rangeDays);
  const from = days[0];
  const reports = await WorkReport.find({ reportType: "work_report", reportDateJ: { $gte: from } }).lean();

  const [companies, contracts] = await Promise.all([
    Company.countDocuments({ isActive: true }),
    Contract.countDocuments({ status: "active", isActive: true }),
  ]);

  const todayKey = jalaliKey();
  const approved = reports.filter((r) => r.status === "approved" || r.status === "settled");
  const approvedIds = approved.map((r) => r._id);
  const approvedItems = await ReportItem.find({ reportId: { $in: approvedIds }, status: "approved" }).lean();
  const approvedTotal = approvedItems.reduce((s, i) => s + (i.totalAmount || 0), 0);

  const byDay = days.map((day) => ({
    day,
    count: reports.filter((r) => r.reportDateJ === day).length,
    amount: reports.filter((r) => r.reportDateJ === day && (r.status === "approved" || r.status === "settled")).length,
  }));

  const statusDist = ["supervisor_review", "expert_review", "employer_ceo_review", "approved", "rejected", "redo_requested", "disputed"].map((s) => ({
    status: s,
    count: reports.filter((r) => r.status === s).length,
  }));

  const groups = await WorkGroup.find({}).select("name").lean();
  const groupDist = groups
    .map((g) => ({ name: g.name, count: reports.filter((r) => String(r.groupId) === String(g._id)).length }))
    .filter((g) => g.count > 0);

  const companyDocs = await Company.find({}).select("name").lean();
  const companyPerf = companyDocs
    .map((c) => {
      const rs = reports.filter((r) => String(r.companyId) === String(c._id));
      return { name: c.name, count: rs.length, approved: rs.filter((r) => r.status === "approved" || r.status === "settled").length };
    })
    .filter((c) => c.count > 0);

  return {
    kpis: {
      activeCompanies: companies,
      activeContracts: contracts,
      todayReports: reports.filter((r) => r.reportDateJ === todayKey).length,
      pendingReports: reports.filter((r) => ["supervisor_review", "expert_review", "employer_ceo_review"].includes(r.status)).length,
      approvedReports: approved.length,
      rejectedReports: reports.filter((r) => r.status === "rejected").length,
      disputedReports: reports.filter((r) => r.status === "disputed").length,
      approvedAmount: approvedTotal,
    },
    trend: byDay,
    statusDist,
    groupDist,
    companyPerf,
  };
}
