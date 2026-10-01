import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type {
  DB, Session, SyncItem, User, WorkReport, WorkGroup, ReportItem, ExtraWorkItem, Attachment,
  Task, TaskStatus, Role, AuditLog, AppNotification, Statement, PurchaseRequest, TaskPriority, ReportStatus,
} from "./types";
import { buildSeed, DB_VERSION } from "./data/seed";
import { normalizeMobile, uid } from "./lib/utils";
import { useToast } from "./components/ui";

const DB_KEY = `tavanban-db-v${DB_VERSION}`;
const SESSION_KEY = "tavanban-session";
const SYNC_KEY = "tavanban-sync";

export interface ReportInput {
  userId?: string;
  groupId: string | null;
  contractId: string;
  reportDateJ: string;
  description?: string;
  taskReferenceId?: string | null;
  items: { priceItemId: string; quantity: number }[];
  extras: { description: string }[];
  photos: { fileName: string; dataUrl: string; size: number }[];
  idempotencyKey: string;
}

export interface StoreApi {
  db: DB;
  session: Session | null;
  user: User | null;
  online: boolean;
  syncBusy: boolean;
  syncQueue: SyncItem[];
  pendingSyncCount: number;

  checkPhone: (raw: string) => { ok: boolean; message?: string; masked?: string; name?: string; mobile?: string };
  sendOtp: (mobile: string) => { ok: boolean; message?: string; devCode?: string };
  verifyOtp: (code: string) => { ok: boolean; message?: string };
  logout: () => void;
  resetAll: () => void;
  updateProfile: (fullName: string) => void;

  userById: (id?: string | null) => User | undefined;
  groupById: (id?: string | null) => WorkGroup | undefined;
  companyById: (id?: string | null) => DB["companies"][number] | undefined;
  contractById: (id?: string | null) => DB["contracts"][number] | undefined;
  reportById: (id?: string | null) => WorkReport | undefined;
  userName: (id?: string | null) => string;
  groupName: (id?: string | null) => string;
  companyName: (id?: string | null) => string;
  contractTitle: (id?: string | null) => string;
  unitName: (id?: string | null) => string;

  userGroups: (userId: string) => WorkGroup[];
  groupMembers: (groupId: string) => { user: User; type: string }[];
  groupPriceItems: (groupId: string) => DB["priceItems"];
  reportItems: (reportId: string) => ReportItem[];
  reportExtras: (reportId: string) => ExtraWorkItem[];
  reportAttachments: (reportId: string) => Attachment[];
  reportTotal: (reportId: string) => number;
  reportEvents: (reportId: string) => DB["approvalEvents"];
  visibleReports: () => WorkReport[];
  visibleTasks: () => Task[];
  visibleAudits: () => AuditLog[];
  visibleExtras: () => ExtraWorkItem[];
  userScore: (userId: string) => number;
  unreadCount: number;

  submitReport: (input: ReportInput, offline: boolean) => { ok: boolean; message: string; queued?: boolean };
  resubmitReport: (reportId: string) => void;
  approvalAction: (reportId: string, action: "approve" | "reject" | "redo" | "dispute", reason?: string) => { ok: boolean; message: string };
  createTask: (input: { title: string; description?: string; groupIds: string[]; userIds: string[]; priority: TaskPriority; dueDateJ: string | null; contractId: string | null }) => { ok: boolean; message: string };
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  submitDailyReport: (input: { dateJ: string; description: string; groupIds: string[]; notes?: string }) => { ok: boolean; message: string };
  mapExtraItem: (extraId: string, priceItemId: string, qty: number, note?: string) => { ok: boolean; message: string };
  rejectExtraItem: (extraId: string, note?: string) => void;
  createPurchaseRequest: (input: { title: string; itemDescription: string; quantity: number; estimatedPrice: number; reason?: string; priority: TaskPriority; contractId: string | null }) => { ok: boolean; message: string };
  decidePurchaseRequest: (id: string, approve: boolean, note?: string) => void;
  markPurchased: (id: string) => void;
  createStatement: (input: { contractId: string; periodStartJ: string; periodEndJ: string }) => { ok: boolean; message: string };
  decideStatement: (id: string, approve: boolean, note?: string) => void;

  addCompany: (input: { name: string; code: string; ceoName: string; ceoMobile: string; phone?: string; address?: string; description?: string }) => { ok: boolean; message: string };
  addContract: (input: { title: string; contractType: DB["contracts"][number]["contractType"]; contractorCompanyId: string; startDateJ: string; endDateJ: string; status: DB["contracts"][number]["status"]; publicNotes?: string }) => { ok: boolean; message: string };
  addUser: (input: { fullName: string; mobile: string; role: Role; unitId?: string | null; companyId?: string | null; groupIds?: string[] }) => { ok: boolean; message: string };
  addUnit: (name: string) => { ok: boolean; message: string };
  addGroup: (input: { name: string; description?: string; contractId: string; supervisorUserId: string | null; memberIds: string[] }) => { ok: boolean; message: string };
  updateGroup: (groupId: string, patch: { name?: string; description?: string; supervisorUserId?: string | null }) => void;
  toggleMembership: (userId: string, groupId: string, type: "member" | "employer_expert" | "employer_ceo") => void;
  addPriceItem: (input: { code: string; title: string; unit: string; unitPrice: number; contractId: string; groupIds: string[] }) => { ok: boolean; message: string };
  updatePriceItem: (id: string, patch: { title?: string; unit?: string; unitPrice?: number; groupIds?: string[] }) => void;
  toggleUserActive: (userId: string) => void;
  toggleEntity: (entity: "companies" | "groups" | "priceItems" | "contracts", id: string) => void;

  markRead: (id: string) => void;
  markAllRead: () => void;
  enqueueSync: (input: ReportInput) => void;
  processSyncQueue: () => void;
}

const StoreCtx = createContext<StoreApi | null>(null);

export function useStore(): StoreApi {
  const v = useContext(StoreCtx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}

function loadDb(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed.version === DB_VERSION) return parsed;
    }
  } catch { /* fallthrough */ }
  return buildSeed();
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch { return null; }
}

function loadQueue(): SyncItem[] {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    return raw ? (JSON.parse(raw) as SyncItem[]) : [];
  } catch { return []; }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => new Date().toISOString();

function notify(d: DB, userId: string, title: string, body: string, entity: AppNotification["entity"], entityId: string) {
  d.notifications.push({ id: uid("n"), userId, title, body, entity, entityId, readAt: null, createdAt: nowIso() });
}

function audit(d: DB, actor: User, action: string, entity: string, entityId: string, detail?: string) {
  d.auditLogs.push({ id: uid("au"), actorUserId: actor.id, actorRole: actor.role, action, entity, entityId, detail, createdAt: nowIso() });
}

function createReportInDb(d: DB, actor: User, input: ReportInput): string {
  const owner = (input.userId ? d.users.find((u) => u.id === input.userId) : undefined) ?? actor;
  const existing = d.reports.find((r) => r.idempotencyKey === input.idempotencyKey && r.userId === owner.id);
  if (existing) return existing.id;
  const group = input.groupId ? d.groups.find((g) => g.id === input.groupId) : null;
  const id = uid("r");
  const supervisorOwn = owner.role === "GROUP_SUPERVISOR";
  const initialStatus: ReportStatus = supervisorOwn ? "expert_review" : "supervisor_review";
  const report: WorkReport = {
    id, reportType: "work_report", userId: owner.id,
    companyId: owner.companyId || actor.companyId || group?.companyId || "",
    groupId: input.groupId, contractId: input.contractId,
    unitId: group?.workUnitId || null,
    reportDateJ: input.reportDateJ, status: initialStatus,
    description: input.description, taskReferenceId: input.taskReferenceId || null,
    idempotencyKey: input.idempotencyKey, submittedAt: nowIso(),
    currentReviewerRole: supervisorOwn ? "EMPLOYER_EXPERT" : "GROUP_SUPERVISOR", createdAt: nowIso(),
  };
  d.reports.push(report);
  for (const it of input.items) {
    const pi = d.priceItems.find((p) => p.id === it.priceItemId);
    if (!pi) continue;
    d.reportItems.push({ id: uid("ri"), reportId: id, priceItemId: pi.id, titleSnapshot: pi.title, unitSnapshot: pi.unit, unitPriceSnapshot: pi.unitPrice, quantity: it.quantity, totalAmount: pi.unitPrice * it.quantity, status: "pending" });
  }
  for (const ex of input.extras) {
    d.extraItems.push({ id: uid("ex"), reportId: id, description: ex.description, status: "pending", createdAt: nowIso() });
  }
  for (const ph of input.photos) {
    d.attachments.push({ id: uid("at"), reportId: id, kind: "image", fileName: ph.fileName, dataUrl: ph.dataUrl, size: ph.size, createdAt: nowIso() });
  }
  d.approvalEvents.push({ id: uid("ev"), reportId: id, actorUserId: actor.id, actorRole: actor.role, action: "submit", fromStatus: "draft", toStatus: initialStatus, createdAt: nowIso() });
  const onBehalf = owner.id !== actor.id ? ` — به نام: ${owner.fullName}` : "";
  const directNote = supervisorOwn ? " — گزارش سرپرست: مستقیم به بررسی کارشناس کارفرما" : "";
  audit(d, actor, "ارسال گزارش کار", "report", id, `${group ? `گروه: ${group.name}` : ""}${onBehalf}${directNote}` || undefined);
  if (!supervisorOwn) {
    const sup = group?.supervisorUserId ? d.users.find((u) => u.id === group.supervisorUserId) : null;
    if (sup && sup.id !== actor.id) notify(d, sup.id, "گزارش جدید در انتظار بررسی", `${owner.fullName} گزارش کاری ثبت کرد و منتظر بررسی شماست.`, "report", id);
  } else if (group) {
    const expertIds = d.memberships.filter((m) => m.groupId === group.id && m.membershipType === "employer_expert" && m.isActive).map((m) => m.userId);
    for (const eid of new Set(expertIds)) {
      if (eid !== actor.id) notify(d, eid, "گزارش سرپرست گروه در انتظار بررسی", `${owner.fullName} (سرپرست ${group.name}) گزارش کاری ثبت کرد.`, "report", id);
    }
  }
  if (owner.id !== actor.id) notify(d, owner.id, "گزارشی برای شما ثبت شد", `${actor.fullName} یک گزارش کاری به نام شما ارسال کرد.`, "report", id);
  return id;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [db, setDb] = useState<DB>(loadDb);
  const [session, setSession] = useState<Session | null>(loadSession);
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [syncQueue, setQueue] = useState<SyncItem[]>(loadQueue);
  const [syncBusy, setSyncBusy] = useState(false);
  const queueRef = useRef(syncQueue);
  const busyRef = useRef(false);
  const dbRef = useRef(db);
  queueRef.current = syncQueue;
  dbRef.current = db;

  useEffect(() => { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* quota */ } }, [db]);
  useEffect(() => { try { session ? localStorage.setItem(SESSION_KEY, JSON.stringify(session)) : localStorage.removeItem(SESSION_KEY); } catch { /* noop */ } }, [session]);
  useEffect(() => { try { localStorage.setItem(SYNC_KEY, JSON.stringify(syncQueue)); } catch { /* noop */ } }, [syncQueue]);

  const mutate = useCallback((fn: (d: DB) => void) => {
    setDb((prev) => { const d = structuredClone(prev) as DB; fn(d); return d; });
  }, []);

  /* ---------------- sync queue ---------------- */

  const processSyncQueue = useCallback(async () => {
    if (busyRef.current) return;
    const pending = queueRef.current.filter((i) => i.status === "pending" || i.status === "failed");
    if (!pending.length) return;
    busyRef.current = true;
    setSyncBusy(true);
    let okCount = 0;
    for (const item of pending) {
      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "sending" as const } : i)));
      await sleep(850);
      const payload = item.payload as ReportInput;
      const userId = payload.userId;
      const exists = dbRef.current.reports.some((r) => r.idempotencyKey === item.idempotencyKey);
      if (!exists && userId) {
        mutate((d) => {
          const u = d.users.find((x) => x.id === userId);
          if (u) createReportInDb(d, u, payload);
        });
      }
      okCount++;
      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "synced" as const, attempts: i.attempts + 1 } : i)));
    }
    busyRef.current = false;
    setSyncBusy(false);
    if (okCount > 0) toast(`${okCount === 1 ? "یک گزارش آفلاین" : `${okCount} گزارش آفلاین`} با موفقیت ارسال شد`, "success");
  }, [mutate, toast]);

  useEffect(() => {
    const goOnline = () => { setOnline(true); processSyncQueue(); };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, [processSyncQueue]);

  /* auto-flush pending offline reports on load when online */
  useEffect(() => {
    const t = setTimeout(() => { if (navigator.onLine) processSyncQueue(); }, 1400);
    return () => clearTimeout(t);
  }, [processSyncQueue]);

  const enqueueSync = useCallback((input: ReportInput) => {
    setQueue((q) => {
      if (q.some((i) => i.idempotencyKey === input.idempotencyKey && i.status !== "synced")) return q;
      return [...q, { id: uid("sq"), endpoint: "/api/v1/reports", payload: input, idempotencyKey: input.idempotencyKey, status: "pending", attempts: 0, createdAt: nowIso() }];
    });
  }, []);

  /* ---------------- auth ---------------- */

  const checkPhone: StoreApi["checkPhone"] = useCallback((raw) => {
    const mobile = normalizeMobile(raw);
    if (!mobile) return { ok: false, message: "شماره موبایل معتبر نیست. فرمت صحیح: 09xxxxxxxxx" };
    const user = dbRef.current.users.find((u) => u.mobile === mobile);
    if (!user) return { ok: false, message: "این شماره موبایل در سامانه ثبت نشده است. با مدیر مربوطه تماس بگیرید." };
    if (!user.isActive) return { ok: false, message: "دسترسی شما غیرفعال شده است. با مدیر تماس بگیرید." };
    return { ok: true, masked: `••••${mobile.slice(7)}`, name: user.fullName, mobile };
  }, []);

  const sendOtp: StoreApi["sendOtp"] = useCallback((mobile) => {
    const cur = dbRef.current.otp;
    if (cur && cur.mobile === mobile && cur.limitedUntil && cur.limitedUntil > Date.now()) {
      return { ok: false, message: "تعداد تلاش‌ها بیش از حد مجاز است؛ چند دقیقه دیگر دوباره تلاش کنید." };
    }
    const code = String(Math.floor(10000 + Math.random() * 90000));
    mutate((d) => { d.otp = { mobile, code, expiresAt: Date.now() + 120000, attempts: 0 }; });
    console.info(`[dev] OTP for ${mobile}: ${code}`);
    return { ok: true, devCode: code };
  }, [mutate]);

  const verifyOtp: StoreApi["verifyOtp"] = useCallback((code) => {
    const otp = dbRef.current.otp;
    if (!otp) return { ok: false, message: "ابتدا کد تایید را درخواست کنید." };
    if (otp.limitedUntil && otp.limitedUntil > Date.now()) return { ok: false, message: "تعداد تلاش‌ها بیش از حد مجاز است؛ چند دقیقه دیگر دوباره تلاش کنید." };
    if (Date.now() > otp.expiresAt) return { ok: false, message: "کد تایید منقضی شده است؛ دوباره ارسال کنید." };
    if (otp.code !== code.trim()) {
      const attempts = otp.attempts + 1;
      mutate((d) => {
        if (d.otp) {
          d.otp.attempts = attempts;
          if (attempts >= 5) d.otp.limitedUntil = Date.now() + 5 * 60000;
        }
      });
      return { ok: false, message: attempts >= 5 ? "به دلیل تلاش‌های مکرر، ورود موقتاً محدود شد." : `کد واردشده اشتباه است. (${5 - attempts} تلاش باقی‌مانده)` };
    }
    const user = dbRef.current.users.find((u) => u.mobile === otp.mobile);
    if (!user) return { ok: false, message: "کاربر یافت نشد." };
    mutate((d) => {
      d.otp = null;
      const u = d.users.find((x) => x.id === user.id);
      if (u) u.lastLoginAt = nowIso();
      if (u) audit(d, u, "ورود به سامانه", "auth", u.id);
    });
    setSession({ userId: user.id, role: user.role, orgId: user.orgId, companyId: user.companyId || null, loginAt: nowIso() });
    return { ok: true };
  }, [mutate]);

  const logout = useCallback(() => {
    if (session) {
      const u = dbRef.current.users.find((x) => x.id === session.userId);
      if (u) mutate((d) => audit(d, u, "خروج از سامانه", "auth", u.id));
    }
    setSession(null);
  }, [session, mutate]);

  const resetAll = useCallback(() => {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SYNC_KEY);
    setQueue([]);
    setDb(buildSeed());
    toast("داده‌های سامانه به حالت اولیه بازگشت", "success");
  }, [toast]);

  const updateProfile: StoreApi["updateProfile"] = useCallback((fullName) => {
    if (!session) return;
    mutate((d) => {
      const u = d.users.find((x) => x.id === session.userId);
      if (u) { u.fullName = fullName; audit(d, u, "ویرایش پروفایل", "user", u.id, fullName); }
    });
    toast("پروفایل به‌روزرسانی شد", "success");
  }, [session, mutate, toast]);

  /* ---------------- selectors ---------------- */

  const user = useMemo(() => (session ? db.users.find((u) => u.id === session.userId) || null : null), [db.users, session]);

  const userById = useCallback((id?: string | null) => db.users.find((u) => u.id === id), [db.users]);
  const groupById = useCallback((id?: string | null) => db.groups.find((g) => g.id === id), [db.groups]);
  const companyById = useCallback((id?: string | null) => db.companies.find((c) => c.id === id), [db.companies]);
  const contractById = useCallback((id?: string | null) => db.contracts.find((c) => c.id === id), [db.contracts]);
  const reportById = useCallback((id?: string | null) => db.reports.find((r) => r.id === id), [db.reports]);
  const userName = useCallback((id?: string | null) => db.users.find((u) => u.id === id)?.fullName || "—", [db.users]);
  const groupName = useCallback((id?: string | null) => db.groups.find((g) => g.id === id)?.name || "—", [db.groups]);
  const companyName = useCallback((id?: string | null) => db.companies.find((c) => c.id === id)?.name || "—", [db.companies]);
  const contractTitle = useCallback((id?: string | null) => db.contracts.find((c) => c.id === id)?.title || "—", [db.contracts]);
  const unitName = useCallback((id?: string | null) => db.workUnits.find((u) => u.id === id)?.name || "—", [db.workUnits]);

  const userGroups = useCallback((userId: string) => {
    const gids = db.memberships.filter((m) => m.userId === userId && m.isActive).map((m) => m.groupId);
    return db.groups.filter((g) => gids.includes(g.id) && g.isActive);
  }, [db.memberships, db.groups]);

  const groupMembers = useCallback((groupId: string) => {
    return db.memberships
      .filter((m) => m.groupId === groupId && m.isActive)
      .map((m) => ({ user: db.users.find((u) => u.id === m.userId)!, type: m.membershipType }))
      .filter((x) => x.user);
  }, [db.memberships, db.users]);

  const groupPriceItems = useCallback((groupId: string) => db.priceItems.filter((p) => p.isActive && p.groupIds.includes(groupId)), [db.priceItems]);
  const reportItems = useCallback((reportId: string) => db.reportItems.filter((i) => i.reportId === reportId), [db.reportItems]);
  const reportExtras = useCallback((reportId: string) => db.extraItems.filter((i) => i.reportId === reportId), [db.extraItems]);
  const reportAttachments = useCallback((reportId: string) => db.attachments.filter((a) => a.reportId === reportId), [db.attachments]);
  const reportEvents = useCallback((reportId: string) => db.approvalEvents.filter((e) => e.reportId === reportId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [db.approvalEvents]);

  const reportTotal = useCallback((reportId: string) => {
    const itemsSum = db.reportItems.filter((i) => i.reportId === reportId && i.status !== "rejected").reduce((s, i) => s + i.totalAmount, 0);
    const extrasSum = db.extraItems.filter((e) => e.reportId === reportId && e.status === "mapped").reduce((s, e) => s + (e.mappedAmount || 0), 0);
    return itemsSum + extrasSum;
  }, [db.reportItems, db.extraItems]);

  const visibleReports = useCallback((): WorkReport[] => {
    if (!user) return [];
    const gidsOf = (types: string[]) => db.memberships.filter((m) => m.userId === user.id && m.isActive && types.includes(m.membershipType)).map((m) => m.groupId);
    switch (user.role) {
      case "DEPUTY": return db.reports;
      case "CONTRACTOR_CEO":
      case "RESIDENT_REP": return db.reports.filter((r) => r.companyId === user.companyId);
      case "GROUP_SUPERVISOR": { const g = gidsOf(["supervisor", "member"]); return db.reports.filter((r) => r.groupId && g.includes(r.groupId)); }
      case "EMPLOYER_EXPERT": { const g = gidsOf(["employer_expert"]); return db.reports.filter((r) => r.groupId && g.includes(r.groupId)); }
      case "EMPLOYER_CEO": { const g = gidsOf(["employer_ceo"]); return db.reports.filter((r) => r.groupId && g.includes(r.groupId)); }
      case "TECHNICIAN": return db.reports.filter((r) => r.userId === user.id);
      default: return [];
    }
  }, [db, user]);

  const visibleTasks = useCallback((): Task[] => {
    if (!user) return [];
    const memberGids = db.memberships.filter((m) => m.userId === user.id && m.isActive).map((m) => m.groupId);
    const supGids = db.memberships.filter((m) => m.userId === user.id && m.isActive && m.membershipType === "supervisor").map((m) => m.groupId);
    const ceoGids = db.memberships.filter((m) => m.userId === user.id && m.isActive && m.membershipType === "employer_ceo").map((m) => m.groupId);
    const hit = (t: Task, gids: string[]) => t.assignedGroupIds.some((g) => gids.includes(g));
    switch (user.role) {
      case "DEPUTY": return db.tasks;
      case "TECHNICIAN": return db.tasks.filter((t) => t.assignedUserIds.includes(user.id) || hit(t, memberGids));
      case "GROUP_SUPERVISOR": return db.tasks.filter((t) => t.createdByUserId === user.id || t.assignedUserIds.includes(user.id) || hit(t, supGids) || hit(t, memberGids));
      case "EMPLOYER_EXPERT": return db.tasks.filter((t) => t.createdByUserId === user.id || t.assignedUserIds.includes(user.id) || db.users.find((u) => u.id === t.createdByUserId)?.orgId === user.orgId);
      case "EMPLOYER_CEO": return db.tasks.filter((t) => t.assignedUserIds.includes(user.id) || hit(t, ceoGids) || db.users.find((u) => u.id === t.createdByUserId)?.orgId === user.orgId);
      case "CONTRACTOR_CEO":
      case "RESIDENT_REP": {
        const companyGids = db.groups.filter((g) => g.companyId === user.companyId).map((g) => g.id);
        return db.tasks.filter((t) => hit(t, companyGids) || db.users.find((u) => u.id === t.createdByUserId)?.companyId === user.companyId);
      }
      default: return [];
    }
  }, [db, user]);

  const visibleAudits = useCallback((): AuditLog[] => {
    if (!user) return [];
    const actorById = (id: string) => db.users.find((u) => u.id === id);
    switch (user.role) {
      case "DEPUTY": return db.auditLogs;
      case "CONTRACTOR_CEO":
      case "RESIDENT_REP":
      case "GROUP_SUPERVISOR":
      case "TECHNICIAN":
        return db.auditLogs.filter((a) => actorById(a.actorUserId)?.companyId === user.companyId);
      default:
        return db.auditLogs.filter((a) => actorById(a.actorUserId)?.orgId === user.orgId || a.actorUserId === user.id);
    }
  }, [db, user]);

  const visibleExtras = useCallback((): ExtraWorkItem[] => {
    if (!user) return [];
    if (user.role === "DEPUTY") return db.extraItems;
    if (user.role === "RESIDENT_REP" || user.role === "CONTRACTOR_CEO") {
      const reportIds = db.reports.filter((r) => r.companyId === user.companyId).map((r) => r.id);
      return db.extraItems.filter((e) => reportIds.includes(e.reportId));
    }
    const own = visibleReports().map((r) => r.id);
    return db.extraItems.filter((e) => own.includes(e.reportId));
  }, [db, user, visibleReports]);

  const userScore = useCallback((userId: string) => db.scoreEvents.filter((s) => s.userId === userId).reduce((s, e) => s + e.score, 0), [db.scoreEvents]);
  const unreadCount = useMemo(() => (user ? db.notifications.filter((n) => n.userId === user.id && !n.readAt).length : 0), [db.notifications, user]);

  /* ---------------- report actions ---------------- */

  const submitReport: StoreApi["submitReport"] = useCallback((input, offline) => {
    if (!user) return { ok: false, message: "نشست شما منقضی شده است." };
    if (input.items.length === 0 && input.extras.length === 0) return { ok: false, message: "حداقل یک آیتم یا کار اضافی اضافه کنید." };
    if (offline) {
      enqueueSync({ ...input, userId: user.id });
      return { ok: true, queued: true, message: "گزارش ذخیره شد و بعد از اتصال به اینترنت ارسال می‌شود." };
    }
    mutate((d) => { createReportInDb(d, user, input); });
    return { ok: true, message: "گزارش با موفقیت ثبت و برای سرپرست گروه ارسال شد." };
  }, [user, enqueueSync, mutate]);

  const resubmitReport: StoreApi["resubmitReport"] = useCallback((reportId) => {
    if (!user) return;
    mutate((d) => {
      const r = d.reports.find((x) => x.id === reportId);
      if (!r || r.userId !== user.id || r.status !== "redo_requested") return;
      const supervisorOwn = user.role === "GROUP_SUPERVISOR";
      r.status = supervisorOwn ? "expert_review" : "supervisor_review";
      r.currentReviewerRole = supervisorOwn ? "EMPLOYER_EXPERT" : "GROUP_SUPERVISOR";
      r.updatedAt = nowIso();
      d.reportItems.forEach((i) => { if (i.reportId === reportId && i.status === "redo") i.status = "pending"; });
      d.approvalEvents.push({ id: uid("ev"), reportId, actorUserId: user.id, actorRole: user.role, action: "resubmit", fromStatus: "redo_requested", toStatus: r.status, createdAt: nowIso() });
      audit(d, user, "ارسال مجدد گزارش", "report", reportId);
      const g = d.groups.find((x) => x.id === r.groupId);
      if (supervisorOwn && g) {
        const expertIds = d.memberships.filter((m) => m.groupId === g.id && m.membershipType === "employer_expert" && m.isActive).map((m) => m.userId);
        for (const eid of new Set(expertIds)) if (eid !== user.id) notify(d, eid, "گزارش مجدد سرپرست ارسال شد", `${user.fullName} گزارش را اصلاح و دوباره ارسال کرد.`, "report", reportId);
      } else {
        const sup = g?.supervisorUserId ? d.users.find((u) => u.id === g.supervisorUserId) : null;
        if (sup && sup.id !== user.id) notify(d, sup.id, "گزارش مجدد ارسال شد", `${user.fullName} گزارش را اصلاح و دوباره ارسال کرد.`, "report", reportId);
      }
    });
    toast("گزارش مجدداً برای بررسی ارسال شد", "success");
  }, [user, mutate, toast]);

  const approvalAction: StoreApi["approvalAction"] = useCallback((reportId, action, reason) => {
    if (!user) return { ok: false, message: "نشست شما منقضی شده است." };
    const r = dbRef.current.reports.find((x) => x.id === reportId);
    if (!r) return { ok: false, message: "گزارش یافت نشد." };
    const expected: Record<string, ReportStatus> = { GROUP_SUPERVISOR: "supervisor_review", EMPLOYER_EXPERT: "expert_review", EMPLOYER_CEO: "employer_ceo_review" };
    const expectedStatus = expected[user.role];
    if (!expectedStatus || r.status !== expectedStatus) return { ok: false, message: "این گزارش در نوبت بررسی شما نیست." };
    if ((action === "reject" || action === "redo" || action === "dispute") && !reason?.trim()) return { ok: false, message: "ثبت دلیل الزامی است." };

    mutate((d) => {
      const rep = d.reports.find((x) => x.id === reportId)!;
      const from = rep.status;
      let to: ReportStatus = from;
      const reporter = d.users.find((u) => u.id === rep.userId);
      if (action === "approve") {
        if (user.role === "GROUP_SUPERVISOR") {
          to = "expert_review"; rep.currentReviewerRole = "EMPLOYER_EXPERT";
          d.memberships.filter((m) => m.groupId === rep.groupId && m.membershipType === "employer_expert" && m.isActive)
            .forEach((m) => notify(d, m.userId, "گزارش تاییدشده سرپرست", `گزارش ${reporter?.fullName || ""} آماده بررسی شماست.`, "report", reportId));
        } else if (user.role === "EMPLOYER_EXPERT") {
          to = "employer_ceo_review"; rep.currentReviewerRole = "EMPLOYER_CEO";
          d.memberships.filter((m) => m.groupId === rep.groupId && m.membershipType === "employer_ceo" && m.isActive)
            .forEach((m) => notify(d, m.userId, "در انتظار تایید نهایی", `گزارش ${reporter?.fullName || ""} توسط کارشناس کارفرما تایید شد.`, "report", reportId));
        } else {
          to = "approved"; rep.currentReviewerRole = null;
          d.reportItems.forEach((i) => { if (i.reportId === reportId && i.status !== "rejected") i.status = "approved"; });
          if (reporter) {
            d.scoreEvents.push({ id: uid("sc"), userId: reporter.id, reportId, score: 5, reason: "تایید نهایی گزارش کار", createdByRole: user.role, createdAt: nowIso() });
            notify(d, reporter.id, "گزارش شما تایید نهایی شد", "۵ امتیاز مثبت در رزومه کاری شما ثبت شد.", "report", reportId);
          }
          const comp = d.companies.find((c) => c.id === rep.companyId);
          if (comp?.contractorCeoUserId) notify(d, comp.contractorCeoUserId, "تایید نهایی گزارش", `گزارش ${reporter?.fullName || ""} تایید نهایی شد و قابل درج در صورت‌وضعیت است.`, "report", reportId);
        }
      } else if (action === "reject") {
        to = "rejected"; rep.currentReviewerRole = null;
        d.reportItems.forEach((i) => { if (i.reportId === reportId) i.status = "rejected"; });
        if (reporter) notify(d, reporter.id, "گزارش شما رد شد", reason || "", "report", reportId);
      } else if (action === "redo") {
        to = "redo_requested"; rep.currentReviewerRole = null;
        d.reportItems.forEach((i) => { if (i.reportId === reportId && i.status !== "rejected") i.status = "redo"; });
        if (reporter) notify(d, reporter.id, "درخواست انجام مجدد", reason || "", "report", reportId);
      } else if (action === "dispute") {
        to = "disputed"; rep.currentReviewerRole = null;
        d.users.filter((u) => u.role === "DEPUTY").forEach((u) => notify(d, u.id, "اختلاف در گزارش", `${user.fullName} برای گزارش ${reporter?.fullName || ""} اختلاف ثبت کرد.`, "report", reportId));
        const comp = d.companies.find((c) => c.id === rep.companyId);
        if (comp?.contractorCeoUserId) notify(d, comp.contractorCeoUserId, "اختلاف در گزارش", `برای گزارش ${reporter?.fullName || ""} اختلاف ثبت شده است.`, "report", reportId);
      }
      rep.status = to;
      rep.updatedAt = nowIso();
      const actionLabel = { approve: "تایید", reject: "رد", redo: "درخواست انجام مجدد", dispute: "ایجاد اختلاف" }[action];
      d.approvalEvents.push({ id: uid("ev"), reportId, actorUserId: user.id, actorRole: user.role, action, fromStatus: from, toStatus: to, reason, createdAt: nowIso() });
      audit(d, user, `${actionLabel} گزارش`, "report", reportId, reason);
    });
    const msgs = { approve: "گزارش تایید و به مرحله بعد ارسال شد", reject: "گزارش رد شد", redo: "درخواست انجام مجدد ثبت شد", dispute: "اختلاف ثبت شد" };
    toast(msgs[action], action === "approve" ? "success" : action === "dispute" ? "warn" : "error");
    return { ok: true, message: msgs[action] };
  }, [user, mutate, toast]);

  /* ---------------- tasks ---------------- */

  const createTask: StoreApi["createTask"] = useCallback((input) => {
    if (!user) return { ok: false, message: "نشست شما منقضی شده است." };
    if (!input.title.trim()) return { ok: false, message: "عنوان کار را وارد کنید." };
    if (input.userIds.length === 0 && input.groupIds.length === 0) return { ok: false, message: "کار را به حداقل یک نفر یا یک گروه بسپارید." };
    mutate((d) => {
      const id = uid("t");
      d.tasks.push({ id, title: input.title, description: input.description, createdByUserId: user.id, assignedUserIds: input.userIds, assignedGroupIds: input.groupIds, contractId: input.contractId, priority: input.priority, dueDateJ: input.dueDateJ, status: "open", sourceRole: user.role, createdAt: nowIso() });
      audit(d, user, "ایجاد کار محوله", "task", id, input.title);
      input.userIds.forEach((uid2) => notify(d, uid2, "کار جدید محول شد", `«${input.title}» به شما واگذار شد.`, "task", id));
    });
    toast("کار محول شد", "success");
    return { ok: true, message: "کار ایجاد شد" };
  }, [user, mutate, toast]);

  const setTaskStatus: StoreApi["setTaskStatus"] = useCallback((taskId, status) => {
    if (!user) return;
    mutate((d) => {
      const t = d.tasks.find((x) => x.id === taskId);
      if (!t) return;
      t.status = status;
      audit(d, user, "تغییر وضعیت کار", "task", taskId, `وضعیت: ${status}`);
      if (status === "done" && t.createdByUserId !== user.id) notify(d, t.createdByUserId, "کار انجام شد", `«${t.title}» توسط ${user.fullName} انجام شد.`, "task", taskId);
    });
    toast("وضعیت کار به‌روزرسانی شد", "success");
  }, [user, mutate, toast]);

  const submitDailyReport: StoreApi["submitDailyReport"] = useCallback((input) => {
    if (!user) return { ok: false, message: "نشست شما منقضی شده است." };
    if (!input.description.trim()) return { ok: false, message: "شرح فعالیت‌ها را وارد کنید." };
    mutate((d) => {
      const id = uid("dr");
      d.reports.push({ id, reportType: "daily_report", userId: user.id, companyId: "", groupId: input.groupIds[0] || null, contractId: "", unitId: user.unitId || null, reportDateJ: input.dateJ, status: "approved", description: input.description + (input.notes ? `\nنکات: ${input.notes}` : ""), idempotencyKey: uid("idem"), currentReviewerRole: null, createdAt: nowIso() });
      audit(d, user, "ثبت گزارش روزانه", "report", id);
      d.memberships.filter((m) => input.groupIds.includes(m.groupId) && m.membershipType === "employer_ceo" && m.isActive)
        .forEach((m) => notify(d, m.userId, "گزارش روزانه کارشناس", `${user.fullName} گزارش روزانه خود را ثبت کرد.`, "report", id));
    });
    toast("گزارش روزانه ثبت شد", "success");
    return { ok: true, message: "ثبت شد" };
  }, [user, mutate, toast]);

  /* ---------------- extras / purchase / statements ---------------- */

  const mapExtraItem: StoreApi["mapExtraItem"] = useCallback((extraId, priceItemId, qty, note) => {
    if (!user) return { ok: false, message: "نشست منقضی شده است." };
    const pi = dbRef.current.priceItems.find((p) => p.id === priceItemId);
    if (!pi) return { ok: false, message: "آیتم معادل را انتخاب کنید." };
    if (qty <= 0) return { ok: false, message: "تعداد باید بیشتر از صفر باشد." };
    mutate((d) => {
      const e = d.extraItems.find((x) => x.id === extraId);
      if (!e) return;
      e.status = "mapped"; e.mappedPriceItemId = priceItemId; e.mappedQuantity = qty; e.mappedAmount = pi.unitPrice * qty; e.mappedByUserId = user.id; e.mappingNote = note || null;
      audit(d, user, "معادل‌سازی کار اضافی", "extraItem", extraId, `${pi.title} × ${qty}`);
      const rep = d.reports.find((r) => r.id === e.reportId);
      if (rep) notify(d, rep.userId, "کار اضافی معادل‌سازی شد", `«${e.description}» با آیتم «${pi.title}» معادل‌سازی شد.`, "extra", extraId);
    });
    toast("معادل‌سازی انجام شد و در صورت‌وضعیت محاسبه می‌شود", "success");
    return { ok: true, message: "انجام شد" };
  }, [user, mutate, toast]);

  const rejectExtraItem: StoreApi["rejectExtraItem"] = useCallback((extraId, note) => {
    if (!user) return;
    mutate((d) => {
      const e = d.extraItems.find((x) => x.id === extraId);
      if (!e) return;
      e.status = "rejected"; e.mappingNote = note || null;
      audit(d, user, "رد کار اضافی", "extraItem", extraId, note);
      const rep = d.reports.find((r) => r.id === e.reportId);
      if (rep) notify(d, rep.userId, "کار اضافی رد شد", note || "کار اضافی ثبت‌شده قابل پرداخت نیست.", "extra", extraId);
    });
    toast("کار اضافی رد شد", "error");
  }, [user, mutate, toast]);

  const createPurchaseRequest: StoreApi["createPurchaseRequest"] = useCallback((input) => {
    if (!user) return { ok: false, message: "نشست منقضی شده است." };
    if (!input.title.trim() || !input.itemDescription.trim()) return { ok: false, message: "عنوان و شرح کالا را کامل کنید." };
    mutate((d) => {
      const id = uid("pr");
      d.purchaseRequests.push({ id, requesterUserId: user.id, companyId: user.companyId || "", contractId: input.contractId, title: input.title, itemDescription: input.itemDescription, quantity: input.quantity, estimatedPrice: input.estimatedPrice, reason: input.reason, priority: input.priority, status: "submitted", createdAt: nowIso() });
      audit(d, user, "ثبت درخواست خرید", "purchase", id, input.title);
      d.users.filter((u) => u.role === "RESIDENT_REP" && u.companyId === user.companyId).forEach((u) => notify(d, u.id, "درخواست خرید جدید", `«${input.title}» در انتظار تصمیم شماست.`, "purchase", id));
    });
    toast("درخواست خرید ثبت شد", "success");
    return { ok: true, message: "ثبت شد" };
  }, [user, mutate, toast]);

  const decidePurchaseRequest: StoreApi["decidePurchaseRequest"] = useCallback((id, approve, note) => {
    if (!user) return;
    mutate((d) => {
      const p = d.purchaseRequests.find((x) => x.id === id);
      if (!p) return;
      p.status = approve ? "approved" : "rejected";
      p.decidedByUserId = user.id;
      p.decisionNote = note || null;
      audit(d, user, approve ? "تایید درخواست خرید" : "رد درخواست خرید", "purchase", id, note);
      notify(d, p.requesterUserId, approve ? "درخواست خرید تایید شد" : "درخواست خرید رد شد", note || p.title, "purchase", id);
    });
    toast(approve ? "درخواست خرید تایید شد" : "درخواست خرید رد شد", approve ? "success" : "error");
  }, [user, mutate, toast]);

  const markPurchased: StoreApi["markPurchased"] = useCallback((id) => {
    if (!user) return;
    mutate((d) => {
      const p = d.purchaseRequests.find((x) => x.id === id);
      if (!p) return;
      p.status = "purchased"; p.purchasedAt = nowIso();
      audit(d, user, "ثبت نتیجه خرید", "purchase", id, p.title);
      notify(d, p.requesterUserId, "خرید انجام شد", `«${p.title}» خریداری و تحویل شد.`, "purchase", id);
    });
    toast("نتیجه خرید ثبت شد", "success");
  }, [user, mutate, toast]);

  const createStatement: StoreApi["createStatement"] = useCallback((input) => {
    if (!user) return { ok: false, message: "نشست منقضی شده است." };
    const used = new Set(dbRef.current.statements.filter((s) => s.status !== "rejected").flatMap((s) => s.reportIds));
    const included = dbRef.current.reports.filter((r) =>
      r.companyId === user.companyId && r.contractId === input.contractId && r.status === "approved" &&
      r.reportDateJ >= input.periodStartJ && r.reportDateJ <= input.periodEndJ && !used.has(r.id)
    );
    if (!included.length) return { ok: false, message: "در این بازه گزارش تایید نهایی‌شده‌ای یافت نشد." };
    mutate((d) => {
      const id = uid("st");
      const total = included.reduce((s, r) => {
        const itemsSum = d.reportItems.filter((i) => i.reportId === r.id && i.status !== "rejected").reduce((a, i) => a + i.totalAmount, 0);
        const extrasSum = d.extraItems.filter((e) => e.reportId === r.id && e.status === "mapped").reduce((a, e) => a + (e.mappedAmount || 0), 0);
        return s + itemsSum + extrasSum;
      }, 0);
      d.statements.push({ id, contractorCompanyId: user.companyId || "", contractId: input.contractId, periodStartJ: input.periodStartJ, periodEndJ: input.periodEndJ, reportIds: included.map((r) => r.id), totalAmount: total, status: "submitted", createdByUserId: user.id, createdAt: nowIso() });
      audit(d, user, "ارسال صورت‌وضعیت", "statement", id, `شامل ${included.length} گزارش`);
      d.users.filter((u) => u.role === "DEPUTY").forEach((u) => notify(d, u.id, "صورت‌وضعیت جدید", `${d.companies.find((c) => c.id === user.companyId)?.name || "پیمانکار"} صورت‌وضعیت ارسال کرد.`, "statement", id));
    });
    toast("صورت‌وضعیت ساخته و برای معاونت ارسال شد", "success");
    return { ok: true, message: "ثبت شد" };
  }, [user, mutate, toast]);

  const decideStatement: StoreApi["decideStatement"] = useCallback((id, approve, note) => {
    if (!user) return;
    mutate((d) => {
      const s = d.statements.find((x) => x.id === id);
      if (!s) return;
      s.status = approve ? "approved" : "rejected";
      s.decidedByUserId = user.id;
      s.decisionNote = note || null;
      audit(d, user, approve ? "تایید صورت‌وضعیت" : "رد صورت‌وضعیت", "statement", id, note);
      notify(d, s.createdByUserId, approve ? "صورت‌وضعیت تایید شد" : "صورت‌وضعیت رد شد", note || "توسط معاونت بهره‌برداری", "statement", id);
    });
    toast(approve ? "صورت‌وضعیت تایید شد" : "صورت‌وضعیت رد شد", approve ? "success" : "error");
  }, [user, mutate, toast]);

  /* ---------------- admin CRUD ---------------- */

  const addCompany: StoreApi["addCompany"] = useCallback((input) => {
    if (!user) return { ok: false, message: "نشست منقضی شده است." };
    const mobile = normalizeMobile(input.ceoMobile);
    if (!mobile) return { ok: false, message: "شماره موبایل مسئول شرکت معتبر نیست." };
    if (dbRef.current.users.some((u) => u.mobile === mobile)) return { ok: false, message: "این شماره موبایل قبلاً در سامانه ثبت شده است." };
    if (!input.name.trim() || !input.code.trim() || !input.ceoName.trim()) return { ok: false, message: "نام شرکت، کد و مشخصات مسئول را کامل کنید." };
    mutate((d) => {
      const ceoId = uid("u");
      const compId = uid("comp");
      d.users.push({ id: ceoId, fullName: input.ceoName, mobile, role: "CONTRACTOR_CEO", orgId: "org-con", companyId: compId, isActive: true, createdAt: nowIso() });
      d.companies.push({ id: compId, name: input.name, code: input.code, contractorCeoUserId: ceoId, phone: input.phone, address: input.address, description: input.description, isActive: true, createdAt: nowIso() });
      audit(d, user, "ایجاد شرکت پیمانکار", "company", compId, input.name);
      audit(d, user, "ایجاد رییس شرکت پیمانکار", "user", ceoId, input.ceoName);
    });
    toast("شرکت و حساب رییس شرکت ایجاد شد", "success");
    return { ok: true, message: "ثبت شد" };
  }, [user, mutate, toast]);

  const addContract: StoreApi["addContract"] = useCallback((input) => {
    if (!user) return { ok: false, message: "نشست منقضی شده است." };
    if (!input.title.trim()) return { ok: false, message: "عنوان قرارداد را وارد کنید." };
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRe.test(input.startDateJ) || !dateRe.test(input.endDateJ)) return { ok: false, message: "تاریخ شروع و پایان شمسی را کامل وارد کنید." };
    mutate((d) => {
      const id = uid("con");
      d.contracts.push({ id, title: input.title, contractType: input.contractType, contractorCompanyId: input.contractorCompanyId, startDateJ: input.startDateJ, endDateJ: input.endDateJ, status: input.status, publicNotes: input.publicNotes, isActive: true, createdAt: nowIso() });
      audit(d, user, "ثبت قرارداد", "contract", id, input.title);
    });
    toast("قرارداد ثبت شد", "success");
    return { ok: true, message: "ثبت شد" };
  }, [user, mutate, toast]);

  const addUser: StoreApi["addUser"] = useCallback((input) => {
    if (!user) return { ok: false, message: "نشست منقضی شده است." };
    const mobile = normalizeMobile(input.mobile);
    if (!mobile) return { ok: false, message: "شماره موبایل معتبر نیست." };
    if (dbRef.current.users.some((u) => u.mobile === mobile)) return { ok: false, message: "این شماره موبایل قبلاً ثبت شده است." };
    if (!input.fullName.trim()) return { ok: false, message: "نام و نام خانوادگی را وارد کنید." };
    mutate((d) => {
      const id = uid("u");
      d.users.push({ id, fullName: input.fullName, mobile, role: input.role, orgId: user.orgId, companyId: input.companyId ?? user.companyId ?? null, unitId: input.unitId ?? null, isActive: true, createdAt: nowIso() });
      (input.groupIds || []).forEach((gid) => {
        d.memberships.push({ id: uid("m"), userId: id, groupId: gid, membershipType: "member", isActive: true });
      });
      audit(d, user, "ایجاد کاربر", "user", id, `${input.fullName} — ${input.role}`);
    });
    toast("کاربر ایجاد شد و می‌تواند با این شماره وارد شود", "success");
    return { ok: true, message: "ثبت شد" };
  }, [user, mutate, toast]);

  const addUnit: StoreApi["addUnit"] = useCallback((name) => {
    if (!user) return { ok: false, message: "نشست منقضی شده است." };
    if (!name.trim()) return { ok: false, message: "نام واحد را وارد کنید." };
    mutate((d) => {
      const id = uid("unit");
      d.workUnits.push({ id, name, orgId: user.orgId, isActive: true });
      audit(d, user, "ایجاد واحد کارفرمایی", "unit", id, name);
    });
    toast("واحد ایجاد شد", "success");
    return { ok: true, message: "ثبت شد" };
  }, [user, mutate, toast]);

  const addGroup: StoreApi["addGroup"] = useCallback((input) => {
    if (!user) return { ok: false, message: "نشست منقضی شده است." };
    if (!input.name.trim()) return { ok: false, message: "نام گروه را وارد کنید." };
    mutate((d) => {
      const id = uid("g");
      d.groups.push({ id, name: input.name, description: input.description, companyId: user.companyId || "", contractId: input.contractId, supervisorUserId: input.supervisorUserId, isActive: true, createdAt: nowIso() });
      if (input.supervisorUserId) d.memberships.push({ id: uid("m"), userId: input.supervisorUserId, groupId: id, membershipType: "supervisor", isActive: true });
      input.memberIds.forEach((mid) => { if (mid !== input.supervisorUserId) d.memberships.push({ id: uid("m"), userId: mid, groupId: id, membershipType: "member", isActive: true }); });
      audit(d, user, "ایجاد گروه کاری", "group", id, input.name);
    });
    toast("گروه ایجاد شد", "success");
    return { ok: true, message: "ثبت شد" };
  }, [user, mutate, toast]);

  const updateGroup: StoreApi["updateGroup"] = useCallback((groupId, patch) => {
    if (!user) return;
    mutate((d) => {
      const g = d.groups.find((x) => x.id === groupId);
      if (!g) return;
      if (patch.name !== undefined) g.name = patch.name;
      if (patch.description !== undefined) g.description = patch.description;
      if (patch.supervisorUserId !== undefined) {
        g.supervisorUserId = patch.supervisorUserId;
        d.memberships.forEach((m) => { if (m.groupId === groupId && m.membershipType === "supervisor") m.isActive = false; });
        if (patch.supervisorUserId) {
          const existing = d.memberships.find((m) => m.groupId === groupId && m.userId === patch.supervisorUserId && m.membershipType === "member");
          if (existing) existing.membershipType = "supervisor";
          else d.memberships.push({ id: uid("m"), userId: patch.supervisorUserId, groupId, membershipType: "supervisor", isActive: true });
        }
      }
      audit(d, user, "تغییر گروه کاری", "group", groupId, g.name);
    });
    toast("گروه به‌روزرسانی شد", "success");
  }, [user, mutate, toast]);

  const toggleMembership: StoreApi["toggleMembership"] = useCallback((userId2, groupId, type) => {
    if (!user) return;
    mutate((d) => {
      const existing = d.memberships.find((m) => m.userId === userId2 && m.groupId === groupId);
      if (existing) existing.isActive = !existing.isActive;
      else d.memberships.push({ id: uid("m"), userId: userId2, groupId, membershipType: type, isActive: true });
      const g = d.groups.find((x) => x.id === groupId);
      audit(d, user, "تغییر عضویت گروه", "membership", groupId, `${d.users.find((u) => u.id === userId2)?.fullName || ""} — ${g?.name || ""}`);
    });
    toast("عضویت به‌روزرسانی شد", "success");
  }, [user, mutate, toast]);

  const addPriceItem: StoreApi["addPriceItem"] = useCallback((input) => {
    if (!user) return { ok: false, message: "نشست منقضی شده است." };
    if (!input.code.trim() || !input.title.trim() || !input.unit.trim()) return { ok: false, message: "کد، عنوان و واحد را کامل کنید." };
    if (input.unitPrice <= 0) return { ok: false, message: "قیمت واحد باید بزرگ‌تر از صفر باشد." };
    if (!input.groupIds.length) return { ok: false, message: "حداقل یک گروه انتخاب کنید." };
    mutate((d) => {
      const id = uid("pi");
      d.priceItems.push({ id, code: input.code, title: input.title, unit: input.unit, unitPrice: input.unitPrice, contractId: input.contractId, groupIds: input.groupIds, isActive: true, createdAt: nowIso() });
      audit(d, user, "ایجاد آیتم بها", "priceItem", id, `${input.code} — ${input.title}`);
    });
    toast("آیتم به فهرست بها اضافه شد", "success");
    return { ok: true, message: "ثبت شد" };
  }, [user, mutate, toast]);

  const updatePriceItem: StoreApi["updatePriceItem"] = useCallback((id, patch) => {
    if (!user) return;
    mutate((d) => {
      const p = d.priceItems.find((x) => x.id === id);
      if (!p) return;
      const priceChanged = patch.unitPrice !== undefined && patch.unitPrice !== p.unitPrice;
      Object.assign(p, patch, { updatedAt: nowIso() });
      audit(d, user, priceChanged ? "تغییر قیمت آیتم بها" : "ویرایش آیتم بها", "priceItem", id, priceChanged ? "گزارش‌های قبلی بدون تغییر ماندند (Snapshot)" : p.title);
    });
    toast("آیتم به‌روزرسانی شد؛ گزارش‌های قبلی تغییر نمی‌کنند", "success");
  }, [user, mutate, toast]);

  const toggleUserActive: StoreApi["toggleUserActive"] = useCallback((userId2) => {
    if (!user) return;
    mutate((d) => {
      const u = d.users.find((x) => x.id === userId2);
      if (!u) return;
      u.isActive = !u.isActive;
      audit(d, user, u.isActive ? "فعال‌سازی کاربر" : "غیرفعال کردن کاربر", "user", userId2, u.fullName);
    });
    toast("وضعیت کاربر تغییر کرد", "success");
  }, [user, mutate, toast]);

  const toggleEntity: StoreApi["toggleEntity"] = useCallback((entity, id) => {
    if (!user) return;
    mutate((d) => {
      const rec = (d[entity] as { id: string; isActive: boolean }[]).find((x) => x.id === id);
      if (!rec) return;
      rec.isActive = !rec.isActive;
      audit(d, user, rec.isActive ? "فعال‌سازی" : "غیرفعال کردن", entity, id);
    });
    toast("وضعیت به‌روزرسانی شد", "success");
  }, [user, mutate, toast]);

  const markRead = useCallback((id: string) => {
    mutate((d) => { const n = d.notifications.find((x) => x.id === id); if (n) n.readAt = nowIso(); });
  }, [mutate]);

  const markAllRead = useCallback(() => {
    if (!user) return;
    mutate((d) => { d.notifications.forEach((n) => { if (n.userId === user.id && !n.readAt) n.readAt = nowIso(); }); });
  }, [user, mutate]);

  const value: StoreApi = {
    db, session, user, online, syncBusy, syncQueue,
    pendingSyncCount: syncQueue.filter((i) => i.status === "pending" || i.status === "sending" || i.status === "failed").length,
    checkPhone, sendOtp, verifyOtp, logout, resetAll, updateProfile,
    userById, groupById, companyById, contractById, reportById,
    userName, groupName, companyName, contractTitle, unitName,
    userGroups, groupMembers, groupPriceItems, reportItems, reportExtras, reportAttachments, reportTotal, reportEvents,
    visibleReports, visibleTasks, visibleAudits, visibleExtras, userScore, unreadCount,
    submitReport, resubmitReport, approvalAction, createTask, setTaskStatus, submitDailyReport,
    mapExtraItem, rejectExtraItem, createPurchaseRequest, decidePurchaseRequest, markPurchased,
    createStatement, decideStatement,
    addCompany, addContract, addUser, addUnit, addGroup, updateGroup, toggleMembership,
    addPriceItem, updatePriceItem, toggleUserActive, toggleEntity,
    markRead, markAllRead, enqueueSync, processSyncQueue,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export type { PurchaseRequest, Statement };
