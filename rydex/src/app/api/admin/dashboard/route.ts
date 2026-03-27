import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";

import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import Booking from "@/models/booking.model";

/* ================================
   GET → ADMIN DASHBOARD DATA
================================ */

export async function GET() {
  try {
    /* ---------- AUTH ---------- */
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDb();

    /* ================================
       STATS
    ================================ */

    const totalVendors = await User.countDocuments({
      role: "vendor",
    });

    const approved = await User.countDocuments({
      role: "vendor",
      vendorStatus: "approved",
    });

    const pending = await User.countDocuments({
      role: "vendor",
      vendorStatus: "pending",
    });

    const rejected = await User.countDocuments({
      role: "vendor",
      vendorStatus: "rejected",
    });

    /* ================================
       PENDING VENDOR REVIEWS
       (Vendor onboarding verification)
    ================================ */

    const pendingVendorUsers = await User.find({
      role: "vendor",
      vendorStatus: "pending",
    })
      .select("name email")
      .lean();

    const vendorIds = pendingVendorUsers.map((v) => v._id);

    const vendorVehicles = await Vehicle.find({
      owner: { $in: vendorIds },
    })
      .select("owner type")
      .lean();

    const vehicleTypeMap = new Map(
      vendorVehicles.map((v) => [
        String(v.owner),
        v.type,
      ])
    );

    const pendingVendors = pendingVendorUsers.map((v) => ({
      _id: v._id,
      name: v.name,
      email: v.email,
      vehicleType:
        vehicleTypeMap.get(String(v._id)) || "—",
    }));

    /* ================================
       PENDING VEHICLE PRICING REVIEWS
       (Pricing + image approval)
    ================================ */

    const pendingVehiclesRaw = await Vehicle.find({
      status: "pending",
      baseFare: { $exists: true },
      pricePerKm: { $exists: true },
    })
      .populate({
        path: "owner",
        select: "name email",
      })
      .lean();

    const pendingVehicles = pendingVehiclesRaw.map(
      (v: any) => ({
        _id: v._id,
        ownerName: v.owner?.name,
        ownerEmail: v.owner?.email,
        vehicleType: v.type,
        baseFare: v.baseFare,
        pricePerKm: v.pricePerKm,
      })
    );

    /* ================================
       EARNINGS - LAST 7 DAYS
    ================================ */
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const earningsBookings = await Booking.find({
      status: "completed",
      paymentStatus: { $in: ["paid", "cash"] },
      createdAt: { $gte: sevenDaysAgo }
    }).select("adminCommission createdAt").lean();

    const earningsMap: Record<string, number> = {};

    earningsBookings.forEach((b: any) => {
      const date = new Date(b.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      if (!earningsMap[date]) {
        earningsMap[date] = 0;
      }

      earningsMap[date] += b.adminCommission || 0;
    });

    const earnings = Object.entries(earningsMap).map(([date, amount]) => ({
      date,
      amount
    }));

    const totalEarnings = earningsBookings.reduce((sum: number, b: any) => sum + (b.adminCommission || 0), 0);

    /* ================================
       RESPONSE
    ================================ */

    return NextResponse.json({
      success: true,
      stats: {
        totalVendors,
        approved,
        pending,
        rejected,
      },
      pendingVendors,
      pendingVehicles,
      earnings,
      totalEarnings
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
