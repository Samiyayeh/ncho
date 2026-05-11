import { useState, useEffect, useCallback } from "react";
import { ProviderLayout } from "../components/ProviderLayout";
import { api } from "../api/client";
import { Link } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import {
  Activity, CheckCircle2, RefreshCw, Shield, AlertCircle, Clock, Users, History, UserCheck, ArrowRight
} from "lucide-react";

// ─── Color palette for bar chart ─────────────────────────────────────────────
const BAR_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatTimestamp = (ts: string) =>
  ts
    ? new Date(ts).toLocaleString('en-PH', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : '—';

const getTimeOnly = (ts: string) =>
  ts
    ? new Date(ts).toLocaleTimeString('en-PH', {
        hour: '2-digit', minute: '2-digit'
      })
    : '—';

// ─── Types ───────────────────────────────────────────────────────────────────
interface DashboardStats {
  activeSessions: number;
  completedToday: number;
  allTimeCompleted: number;
  topDiagnoses: { name: string; count: number }[];
  myCompletedToday: number;
  recentEncounters: any[];
}

interface DpaLog {
  log_id: number;
  action_taken: string;
  endpoint_accessed: string;
  ip_address: string;
  timestamp: string;
  Provider: { first_name: string; last_name: string } | null;
  Patient: { first_name: string; last_name: string; patient_id: string } | null;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function ProviderDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dpaLogs, setDpaLogs] = useState<DpaLog[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const userRaw = localStorage.getItem('ncho_user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const providerName = user ? `Dr. ${user.last_name || user.first_name}` : 'Provider';

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await api.get('/encounters/dashboard-stats');
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch dashboard stats', e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchDpaFeed = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const data = await api.get('/encounters/dpa-feed');
      setDpaLogs(data);
    } catch (e) {
      console.error('Failed to fetch DPA feed', e);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const handleRefresh = () => {
    setLastRefreshed(new Date());
    fetchStats();
    fetchDpaFeed();
  };

  useEffect(() => {
    fetchStats();
    fetchDpaFeed();
  }, [fetchStats, fetchDpaFeed]);

  // ── KPI card helper ─────────────────────────────────────────────────────────
  const KpiCard = ({
    label, value, icon: Icon, colorClass, bgClass, description
  }: {
    label: string; value: number | string; icon: any;
    colorClass: string; bgClass: string; description: string;
  }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
      </div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-4xl font-black ${colorClass} mb-1`}>
        {loadingStats ? (
          <span className="inline-block w-12 h-8 bg-gray-100 rounded animate-pulse" />
        ) : value}
      </p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8 bg-slate-50">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, {providerName}. Here is your clinical overview for today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Refreshed {formatTimestamp(lastRefreshed.toISOString())}
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Section 1: Personal & Operational Overview ──────────────── */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          
          {/* Daily Progress Summary */}
          <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-blue-200" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-blue-100">Patients Seen Today</h2>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black leading-none">
                  {loadingStats ? '...' : stats?.myCompletedToday ?? 0}
                </span>
                <span className="text-xl font-medium text-blue-100 opacity-80">
                  Total Consultations
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-4 font-medium uppercase tracking-widest">
                Personal daily performance
              </p>
            </div>
            {/* Decorative background element */}
            <Activity className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
          </div>

          {/* System Overview KPIs */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            <KpiCard
              label="Active Sessions"
              value={stats?.activeSessions ?? 0}
              icon={Activity}
              colorClass="text-orange-600"
              bgClass="bg-orange-50"
              description="Encounters currently in progress across the system"
            />
            <KpiCard
              label="Total System Completions"
              value={stats?.completedToday ?? 0}
              icon={CheckCircle2}
              colorClass="text-green-600"
              bgClass="bg-green-50"
              description="All consultations finalized today in NCHO"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* ── Recent Patient Activity (New) ─────────────────────────── */}
          <section className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <History className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-800">Recent Patients</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last 5 Consultations</p>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loadingStats ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 border-b border-gray-50 animate-pulse">
                      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-50 rounded w-1/2" />
                    </div>
                  ))
                ) : !stats?.recentEncounters?.length ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                    <Users className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No recent consultations</p>
                    <p className="text-xs">Your completed encounters will appear here.</p>
                  </div>
                ) : (
                  stats.recentEncounters.map((enc) => (
                    <Link 
                      key={enc.encounter_id}
                      to={`/provider/clinical/${enc.Patient?.patient_id}`}
                      className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-blue-50/50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {enc.Patient?.first_name[0]}{enc.Patient?.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">
                            {enc.Patient?.first_name} {enc.Patient?.last_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                              enc.encounter_type === 'FILE_UPLOAD' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {enc.encounter_type === 'FILE_UPLOAD' ? 'File Upload' : 'Consultation'}
                            </span>
                            <p className="text-xs text-gray-400 font-medium truncate max-w-[120px]">
                              {getTimeOnly(enc.encounter_date)} · {enc.encounter_type === 'FILE_UPLOAD' ? enc.diagnosis : (enc.diagnosis || 'No Diagnosis')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transform group-hover:translate-x-1 transition" />
                    </Link>
                  ))
                )}
              </div>
              
              <Link 
                to="/provider"
                className="p-4 text-center text-sm font-bold text-blue-600 hover:bg-blue-50 transition border-t border-gray-50"
              >
                View Patient Directory
              </Link>
            </div>
          </section>

          {/* ── Section 2: Public Health Trends (Kept) ────────────────── */}
          <section className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-800">Public Health Trends</h2>
              <span className="ml-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-xs font-bold rounded-full">Top Diagnoses</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">Top 5 Most Frequent Diagnoses</h3>
                  <p className="text-xs text-gray-400 mt-1">Aggregated from all completed encounters</p>
                </div>
              </div>

              <div className="flex-1">
                {loadingStats ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm font-medium">Loading data...</p>
                  </div>
                ) : !stats?.topDiagnoses?.length ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <AlertCircle className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-sm font-medium">No diagnosis data available yet.</p>
                    <p className="text-xs mt-1">Complete some encounters to see trends.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.topDiagnoses}
                      layout="vertical"
                      margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={150}
                        tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                      />
                      <Tooltip
                        cursor={{ fill: '#F9FAFB' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value} cases`, 'Count']}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={30}>
                        {stats.topDiagnoses.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Legend */}
              {!loadingStats && stats?.topDiagnoses?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {stats.topDiagnoses.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />
                      <span className="text-[10px] font-bold text-gray-500">{d.name} ({d.count})</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </div>

        {/* ── Section 3: DPA Security Audit Feed (Kept) ────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-800">DPA Security Audit Feed</h2>
            <span className="ml-1 px-2 py-0.5 bg-teal-50 text-teal-600 text-xs font-bold rounded-full">Real-Time</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Most Recent Access Events</h3>
                <p className="text-xs text-gray-400 mt-0.5">Data Privacy Act compliance monitoring — all events are permanent and immutable</p>
              </div>
              <Shield className="w-6 h-6 text-teal-300" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingLogs ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : dpaLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-medium">No audit events recorded yet.</p>
                      </td>
                    </tr>
                  ) : (
                    dpaLogs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-gray-50/60 transition">
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap font-mono">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">
                            {log.Provider ? `Dr. ${log.Provider.last_name}` : '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {log.Patient ? (
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {log.Patient.first_name} {log.Patient.last_name}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">{log.Patient.patient_id}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                            {log.action_taken}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                          {log.ip_address || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Compliance Footer */}
            <div className="px-6 py-4 bg-teal-50 border-t border-teal-100 flex items-center gap-3">
              <Shield className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <p className="text-xs text-teal-800">
                <span className="font-bold">Data Privacy Act Compliance:</span>{' '}
                All access events are permanently logged. Available for NPC audit.
              </p>
            </div>
          </div>
        </section>

      </div>
    </ProviderLayout>
  );
}
