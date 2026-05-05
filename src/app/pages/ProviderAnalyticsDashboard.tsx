import { useState, useEffect } from "react";
import { ProviderLayout } from "../components/ProviderLayout";
import { api } from "../api/client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, Users, Activity, Layers } from "lucide-react";

const calculateAge = (dob: string | undefined) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ProviderAnalyticsDashboard() {
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'today' | 'all'>('all');

  // Read provider from localStorage
  const userRaw = localStorage.getItem('ncho_user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const roleType = user?.role_type || 'PHYSICIAN';
  const providerName = user ? `Dr. ${user.last_name || user.first_name}` : 'Provider';

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        let query = `/queue/daily?status=all`;
        if (timeframe === 'today') {
          query += `&date=${new Date().toISOString().split('T')[0]}`;
        } else {
          query += `&date=all`;
        }
        
        // Add status filters similar to ProviderDashboard if needed,
        // but for analytics, seeing the whole clinic's data is often better.
        // We will fetch everything the user is authorized to see.
        const data = await api.get(query);
        setQueues(data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeframe]);

  // Aggregate Data
  const totalQueued = queues.length;
  const totalCompleted = queues.filter(q => q.status === 'COMPLETED').length;
  const totalPendingTriage = queues.filter(q => q.status === 'PENDING_TRIAGE').length;

  // Gender Demographics
  const genderMap: Record<string, number> = {};
  // Age Groups
  const ageGroups = {
    '0-18': 0,
    '19-35': 0,
    '36-60': 0,
    '60+': 0
  };
  // Service Breakdown
  const serviceMap: Record<string, number> = {};

  queues.forEach(q => {
    // Gender
    const gender = q.Patient?.gender || 'Unknown';
    genderMap[gender] = (genderMap[gender] || 0) + 1;

    // Age
    const age = calculateAge(q.Patient?.date_of_birth);
    if (age !== null) {
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 60) ageGroups['36-60']++;
      else ageGroups['60+']++;
    }

    // Service
    const service = q.service_type || 'Unknown';
    serviceMap[service] = (serviceMap[service] || 0) + 1;
  });

  const genderData = Object.keys(genderMap).map(key => ({ name: key, value: genderMap[key] }));
  const ageData = Object.keys(ageGroups).map(key => ({ name: key, count: ageGroups[key as keyof typeof ageGroups] }));
  const serviceData = Object.keys(serviceMap).map(key => ({ name: key.replace('_', ' '), count: serviceMap[key] }));

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8 bg-slate-50">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">High-level clinic metrics and patient demographics</p>
          </div>
          
          {/* Timeframe Toggle */}
          <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                timeframe === 'today' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                timeframe === 'all' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-3xl font-black text-gray-900">{loading ? '...' : totalQueued}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-xl">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Encounters / Visited</p>
              <h3 className="text-3xl font-black text-gray-900">{loading ? '...' : totalCompleted}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Timeframe</p>
              <h3 className="text-xl font-black text-gray-900 mt-1">{timeframe === 'today' ? 'Today' : 'All-Time'}</h3>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Gender Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Gender Demographics</h3>
            <div className="h-72">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>
              ) : genderData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Age Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Age Distribution</h3>
            <div className="h-72">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-1 gap-8">
          {/* Service Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Service Distribution</h3>
            <div className="h-80">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} />
                    <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

      </div>
    </ProviderLayout>
  );
}
