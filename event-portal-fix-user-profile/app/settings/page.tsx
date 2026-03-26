import DashboardLayout from "@/components/DashboardLayout";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm mx-3 mt-2 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "Chillax, sans-serif" }}>Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>
      <div className="px-8 py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
        <p className="text-base">Coming soon</p>
      </div>
    </DashboardLayout>
  );
}
