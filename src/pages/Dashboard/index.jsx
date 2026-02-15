import Sidebar from '../../components/Sidebar';

function Dashboard() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back, here&apos;s your tax status for May 2024.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium">
                <span className="material-icons text-sm">calendar_today</span>
                May 1 - May 31, 2024
              </button>
            </div>
            <button className="p-2 bg-white dark:bg-slate-custom border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500">
              <span className="material-icons">notifications</span>
            </button>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6 auto-rows-[160px]">
          {/* Featured Card (Large 2x2 style) */}
          <div className="col-span-12 lg:col-span-8 row-span-2 bg-primary rounded-xl p-8 flex flex-col justify-between relative overflow-hidden border border-white/10 shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="material-icons text-[120px]">account_balance_wallet</span>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs font-medium backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                Action Required: SST Filing
              </div>
              <h2 className="text-white/70 mt-6 text-lg font-medium">Total SST Payable</h2>
              <div className="text-white text-5xl font-bold mt-2 tracking-tight">RM 12,450.00</div>
              <p className="text-white/60 text-sm mt-4 flex items-center gap-2">
                <span className="material-icons text-sm">schedule</span>
                SST-02 Due in 12 days (June 15, 2024)
              </p>
            </div>
            <div className="relative z-10 flex gap-4">
              <button className="bg-white text-primary px-6 py-3 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg">
                Pay Now
              </button>
              <button className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors backdrop-blur-sm">
                Download Report
              </button>
            </div>
          </div>

          {/* Secondary Card (Medium 4x1) */}
          <div className="col-span-12 lg:col-span-4 row-span-2 bg-slate-custom rounded-xl p-6 border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Next LHDN Deadline</h3>
                <span className="material-icons text-slate-400">event</span>
              </div>
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-1">14</div>
                  <div className="text-slate-400 text-xs uppercase tracking-widest font-bold">Days Left</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium text-sm">Form C</span>
                  <span className="text-xs font-bold text-emerald-400">35% Ready</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[35%]"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Filing Period: 2023</span>
                <span className="text-white">Due: 30 June 2024</span>
              </div>
            </div>
          </div>

          {/* Recent Expenses (Medium-Wide) */}
          <div className="col-span-12 lg:col-span-7 row-span-2 bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold dark:text-white">Recent Tax-Deductible Expenses</h3>
              <button className="text-primary dark:text-emerald-400 text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-slate-200 dark:divide-slate-700/50">
                <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <span className="material-icons text-xl">apartment</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold dark:text-white">Office Rental (May)</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Property &amp; Utilities • 12 May 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold dark:text-white">-RM 4,500.00</p>
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">Verified</span>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <span className="material-icons text-xl">cloud</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold dark:text-white">Adobe Creative Cloud</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Software Subscription • 10 May 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold dark:text-white">-RM 245.00</p>
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">Pending Receipt</span>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <span className="material-icons text-xl">electric_bolt</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold dark:text-white">TNB Electricity Bill</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Utilities • 08 May 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold dark:text-white">-RM 1,203.40</p>
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Activity (Small-Square style) */}
          <div className="col-span-12 lg:col-span-5 row-span-2 bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold dark:text-white">Staff Activity</h3>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div className="flex gap-4">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    <img
                      alt="Sarah"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCJdSTgzN6sI6rMiTsd-uRjLMqXaZbhRI2ofWA04G-Iv-VZGhlsqyJx58eYJ4HGBPAnnJTKX0Uh6OSEEq33GyYlxMc4GcgYsVuXwEkVJuI17Sns7Aa4pL7p-b4kO0uoMWwvLftAO5-Cp2ggimaC4llnNtEyKEuHAWwcLxeN3kRLbxtC3xeSZyZEqiYCafMbVp-VizuWlR0IxP-DXVSZKJ9Ky9jJ0WqHa7liJZTlCG1zlOVp_45LDnLZ6r5hYCwBvYnnEDuYPa5Vos"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-custom rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">2 hours ago</p>
                  <p className="text-sm dark:text-slate-200 leading-tight">
                    <span className="font-bold text-slate-900 dark:text-white">Sarah Lee</span> uploaded 12 new invoices for <span className="text-primary dark:text-emerald-400 font-medium">Q2 Expenses</span>.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-icons text-primary dark:text-emerald-400 text-sm">sync</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">5 hours ago</p>
                  <p className="text-sm dark:text-slate-200 leading-tight">
                    <span className="font-bold text-slate-900 dark:text-white">System</span> successfully synced with <span className="font-medium">MyTax LHDN Portal</span>.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  <img
                    alt="Michael"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6CJZBx2V8L4hZzUSZde4b1X-ndpRBwx6AyyaosgS9IcmneKnuVTj4rfUX5S-Hy1nVcWAhcINkACT1v06uNEGBJGTV66lhI3Mo1YvuJRXG7ILgROwbAdycVW5psU2pXUvJLDGL_g1sI3dPTgJLpQUyCgQww9yJomX17IKonw2KuaV8R81Vfl-xC8kItAn8T6w2GPuKVGE7d0_w-uflPGK-CZ9WOW3r-FiMvU6neshFwkffEmnH9KJ-OsgD218uec-lXLTG4UyLARU"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Yesterday</p>
                  <p className="text-sm dark:text-slate-200 leading-tight">
                    <span className="font-bold text-slate-900 dark:text-white">Michael Tan</span> updated tax category for <span className="italic">&quot;Hardware Purchase&quot;</span>.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center rounded-b-xl">
              <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">Show Full Audit Log</button>
            </div>
          </div>

          {/* Mini Widget: Upload Quick Action */}
          <div className="col-span-12 lg:col-span-4 row-span-1 bg-white dark:bg-slate-custom rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 cursor-pointer hover:border-primary dark:hover:border-emerald-500 transition-colors group">
            <span className="material-icons text-slate-400 group-hover:text-primary transition-colors text-3xl mb-2">cloud_upload</span>
            <span className="font-bold text-sm dark:text-white">Quick Upload Receipt</span>
            <span className="text-xs text-slate-500">PDF, JPG or PNG up to 10MB</span>
          </div>

          {/* Mini Widget: Support */}
          <div className="col-span-12 lg:col-span-4 row-span-1 bg-white dark:bg-slate-custom rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
              <span className="material-icons">support_agent</span>
            </div>
            <div>
              <h4 className="font-bold text-sm dark:text-white">Tax Expert Support</h4>
              <p className="text-xs text-slate-500">Speak to an advisor now</p>
              <button className="mt-2 text-primary dark:text-emerald-400 text-xs font-bold">Open Chat</button>
            </div>
          </div>

          {/* Mini Widget: Tax Savings */}
          <div className="col-span-12 lg:col-span-4 row-span-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-lg flex items-center justify-center">
              <span className="material-icons">savings</span>
            </div>
            <div>
              <h4 className="font-bold text-sm dark:text-emerald-400">Projected Savings</h4>
              <div className="text-xl font-bold dark:text-white">RM 2,840.50</div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Optimized for 2024</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
