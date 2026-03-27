"use client";

import PartnerEarningsChart from "@/components/PartnerEarningChart";
import dynamic from "next/dynamic";
import { Car, Navigation, IndianRupee, Calendar, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

const BookingList = dynamic(() => import("@/app/partner/bookings/page"), { ssr: false });

export default function PartnerDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* NAVBAR */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

          <Link
            href="/"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md transition"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">
            Partner Dashboard
          </h1>
          <p className="text-gray-600 text-sm md:text-lg">
            Manage rides, earnings & bookings
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* CHART */}
          <div className="lg:col-span-2 order-2 lg:order-1 bg-white rounded-3xl shadow-lg p-4 md:p-6">
            <PartnerEarningsChart />
          </div>

          {/* BOOKINGS */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-3xl shadow-lg p-5 md:p-6 sticky top-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Rides</h2>
                  <p className="text-gray-500 text-sm">Latest bookings</p>
                </div>
              </div>
              <BookingList />
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mt-10">
          {/* CARD */}
          <ActionCard
            icon={<Navigation className="w-6 h-6 text-white" />}
            title="Active Ride"
            desc="Check current ride"
            link="/partner/active-ride"
            color="from-blue-500 to-indigo-600"
          />

          <ActionCard
            icon={<IndianRupee className="w-6 h-6 text-white" />}
            title="Earnings"
            desc="Track income"
            link="/partner/bookings"
            color="from-emerald-500 to-teal-600"
          />

          <ActionCard
            icon={<Calendar className="w-6 h-6 text-white" />}
            title="Bookings"
            desc="View all bookings"
            link="/partner/bookings"
            color="from-purple-500 to-pink-600"
          />
        </div>
      </div>
    </div>
  );
}

/* REUSABLE CARD */
type ActionCardProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  link: string;
  color: string;
};

function ActionCard({ icon, title, desc, link, color }: ActionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 text-center hover:shadow-xl transition hover:-translate-y-1">
      <div
        className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{desc}</p>

      <Link
        href={link}
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Open <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
