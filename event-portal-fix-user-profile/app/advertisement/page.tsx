import DashboardLayout from "@/components/DashboardLayout";

export default function AdvertisementPage() {
  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white/70 backdrop-blur-sm">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "Chillax, sans-serif" }}>
          Advertisement
        </h1>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-10 flex items-center justify-center">
          <p className="text-sm text-gray-400">
            Advertisement management coming soon...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
