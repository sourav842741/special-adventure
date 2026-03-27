import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ fix here
) {
  await connectDb();

  const { id } = await context.params; // ✅ important

  const booking = await Booking.findById(id);

  if (!booking) {
    return NextResponse.json(
      { message: "Not found" },
      { status: 404 }
    );
  }

  booking.status = "completed";
  booking.completedAt = new Date();

  if (booking.partnerAmount === 0 && booking.fare > 0) {
    const adminCommission = booking.fare * 0.10;
    booking.adminCommission = adminCommission;
    booking.partnerAmount = booking.fare - adminCommission;
  }

  await booking.save();

  return NextResponse.json({ success: true });
}