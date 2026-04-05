import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { subDays, format, startOfDay, endOfDay } from "date-fns"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const today = new Date()

    const [totalPatients, appointmentsToday, beds, bloodBankData, pendingLabs, allAppts, recentActivity] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({ where: { date: { gte: startOfDay(today), lte: endOfDay(today) } } }),
      prisma.bed.findMany({ select: { type: true, status: true } }),
      prisma.bloodBank.findMany(),
      prisma.labReport.count({ where: { status: { in: ["PENDING", "IN_PROGRESS"] } } }),
      prisma.appointment.findMany({
        where: { date: { gte: subDays(today, 30) } },
        include: { doctor: { select: { department: true } } },
      }),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
    ])

    const occupiedBeds = beds.filter((b: { type: string; status: string }) => b.status === "OCCUPIED").length
    const bedOccupancyPct = beds.length > 0 ? Math.round((occupiedBeds / beds.length) * 100) : 0
    const totalBloodUnits = bloodBankData.reduce((s: number, b: { unitsAvailable: number }) => s + b.unitsAvailable, 0)

    // Appointments last 30 days
    const chartMap = new Map<string, number>()
    for (let i = 29; i >= 0; i--) { chartMap.set(format(subDays(today, i), "MM/dd"), 0) }
    allAppts.forEach((a: { date: Date | string; doctor: { department: string } }) => { const k = format(new Date(a.date), "MM/dd"); if (chartMap.has(k)) chartMap.set(k, (chartMap.get(k) || 0) + 1) })
    const appointmentsChart = Array.from(chartMap.entries()).map(([date, count]) => ({ date, count }))

    // Beds by type
    const bedTypes = ["ICU", "GENERAL", "EMERGENCY", "PRIVATE"]
    const bedsByType = bedTypes.map(type => ({
      type,
      available: beds.filter((b: { type: string; status: string }) => b.type === type && b.status === "AVAILABLE").length,
      occupied: beds.filter((b: { type: string; status: string }) => b.type === type && b.status === "OCCUPIED").length,
    }))

    // Blood bank
    const bloodBank = bloodBankData.map((b: { bloodGroup: string; unitsAvailable: number }) => ({
      group: b.bloodGroup.replace("_POS", "+").replace("_NEG", "-").replace("AB", "AB").replace("O", "O"),
      units: b.unitsAvailable,
    }))

    // Dept appointments
    const deptMap = new Map<string, number>()
    allAppts.forEach((a: { doctor: { department: string } }) => { const d = a.doctor.department; deptMap.set(d, (deptMap.get(d) || 0) + 1) })
    const deptAppointments = Array.from(deptMap.entries()).map(([name, value]) => ({ name, value })).sort((a: { value: number }, b: { value: number }) => b.value - a.value).slice(0, 8)

    return NextResponse.json({
      data: {
        totalPatients, appointmentsToday, bedOccupancyPct, totalBloodUnits, pendingLabs,
        appointmentsChart, bedsByType, bloodBank, deptAppointments,
        recentActivity: recentActivity.map((a: { action: string; entity: string; createdAt: Date }) => ({ action: a.action, entity: a.entity, createdAt: a.createdAt })),
      }
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 })
  }
}
