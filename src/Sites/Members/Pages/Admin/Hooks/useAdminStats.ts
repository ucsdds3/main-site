import { useState, useEffect } from "react";
import { supabase } from "src/Utils/supabase";
import { formatNumber } from "src/Utils/functions";

interface StatData {
  value: string;
  hint: string;
  loading: boolean;
}

export function useAdminStats() {
  const [members, setMembers] = useState<StatData>({ value: "0", hint: "", loading: true });
  const [admins, setAdmins] = useState<StatData>({ value: "0", hint: "", loading: true });
  const [events, setEvents] = useState<StatData>({ value: "0", hint: "", loading: true });
  // const [pendingOrders, setPendingOrders] = useState<StatData>({
  //   value: "0",
  //   hint: "",
  //   loading: true,
  // });
  // const [totalOrders, setTotalOrders] = useState<StatData>({ value: "0", hint: "", loading: true });
  const [eventAttendance, setEventAttendance] = useState<StatData>({
    value: "0",
    hint: "",
    loading: true,
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const now = new Date();
        const nowISO = now.toISOString();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate dates for past 30 days comparison
        const past30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const past60DaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Fetch all stats in parallel
        const [
          activeMembersCurrent,
          activeMembersLastMonth,
          adminsCurrent,
          adminsLastMonth,
          upcomingEventsCurrent,
          nextEvent,
          // pendingOrdersCount,
          // oldestPendingOrder,
          // totalOrdersCurrent,
          // totalOrdersLastMonth,
          eventAttendanceCurrent,
          eventAttendanceLastMonth,
        ] = await Promise.all([
          // Active members - current count
          supabase.from("Members").select("*", { count: "exact", head: true }).eq("deleted", false),
          // Active members - last month count
          supabase
            .from("Members")
            .select("*", { count: "exact", head: true })
            .eq("deleted", false)
            .lt("created_at", startOfCurrentMonth.toISOString()),
          // Admins - current count
          supabase
            .from("Members")
            .select("*", { count: "exact", head: true })
            .in("admin_level", ["Board", "Executive"]),
          // Admins - last month count
          supabase
            .from("Members")
            .select("*", { count: "exact", head: true })
            .in("admin_level", ["Board", "Executive"])
            .lt("created_at", startOfCurrentMonth.toISOString()),
          // Upcoming events - current count
          supabase
            .from("Events")
            .select("*", { count: "exact", head: true })
            .eq("deleted", false)
            .gt("start", nowISO),
          // Next upcoming event
          supabase
            .from("Events")
            .select("start")
            .eq("deleted", false)
            .gt("start", nowISO)
            .order("start", { ascending: true })
            .limit(1),
          // Pending orders (Ordered + Shipped) - count
          supabase
            .from("Purchases")
            .select("*", { count: "exact", head: true })
            .in("status", ["Ordered", "Shipped"]),
          // Oldest pending order (for age calculation)
          supabase
            .from("Purchases")
            .select("created_at")
            .in("status", ["Ordered", "Shipped"])
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle(),
          // Total orders - current count
          supabase.from("Purchases").select("*", { count: "exact", head: true }),
          // Total orders - last month count
          supabase
            .from("Purchases")
            .select("*", { count: "exact", head: true })
            .lt("created_at", startOfCurrentMonth.toISOString()),
          // Event attendance - past 30 days count
          supabase
            .from("Attendance")
            .select("*", { count: "exact", head: true })
            .gte("created_at", past30DaysAgo.toISOString()),
          // Event attendance - previous 30 days count (30-60 days ago)
          supabase
            .from("Attendance")
            .select("*", { count: "exact", head: true })
            .gte("created_at", past60DaysAgo.toISOString())
            .lt("created_at", past30DaysAgo.toISOString()),
        ]);

        // Process active members stats
        const activeMembersCurrentCount = activeMembersCurrent.count || 0;
        const activeMembersLastMonthCount = activeMembersLastMonth.count || 0;
        const activeMembersChange = activeMembersCurrentCount - activeMembersLastMonthCount;
        const activeMembersPercentChange =
          activeMembersLastMonthCount > 0
            ? ((activeMembersChange / activeMembersLastMonthCount) * 100).toFixed(1)
            : "0.0";
        const activeMembersSign = activeMembersChange >= 0 ? "+" : "";
        const activeMembersHint = `${activeMembersSign}${activeMembersPercentChange}% this month`;

        // Process admins stats
        const adminsCurrentCount = adminsCurrent.count || 0;
        const adminsLastMonthCount = adminsLastMonth.count || 0;
        const adminsChange = adminsCurrentCount - adminsLastMonthCount;
        const adminsPercentChange =
          adminsLastMonthCount > 0
            ? ((adminsChange / adminsLastMonthCount) * 100).toFixed(1)
            : "0.0";
        const adminsSign = adminsChange >= 0 ? "+" : "";
        const adminsHint = `${adminsSign}${adminsPercentChange}% this month`;

        // Process upcoming events stats
        const upcomingEventsCurrentCount = upcomingEventsCurrent.count || 0;
        let upcomingEventsHint = "";
        if (
          !nextEvent.error &&
          nextEvent.data &&
          nextEvent.data.length > 0 &&
          nextEvent.data[0]?.start
        ) {
          const nextEventDate = new Date(nextEvent.data[0].start);
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const month = monthNames[nextEventDate.getMonth()];
          const day = nextEventDate.getDate();
          upcomingEventsHint = `Next: ${month} ${day}`;
        }

        setMembers({
          value: formatNumber(activeMembersCurrentCount),
          hint: activeMembersHint,
          loading: false,
        });
        setAdmins({
          value: formatNumber(adminsCurrentCount),
          hint: adminsHint,
          loading: false,
        });
        setEvents({
          value: formatNumber(upcomingEventsCurrentCount),
          hint: upcomingEventsHint,
          loading: false,
        });

        // Process pending orders stats
        // const pendingOrdersCountValue = pendingOrdersCount.count || 0;
        // let pendingOrdersHint = "No pending orders";
        // if (
        //   !oldestPendingOrder.error &&
        //   oldestPendingOrder.data &&
        //   oldestPendingOrder.data.created_at
        // ) {
        //   const oldestOrderDate = new Date(oldestPendingOrder.data.created_at);
        //   const ageInDays = Math.floor(
        //     (now.getTime() - oldestOrderDate.getTime()) / (1000 * 60 * 60 * 24)
        //   );
        //   if (ageInDays === 0) {
        //     pendingOrdersHint = "Oldest: Today";
        //   } else if (ageInDays === 1) {
        //     pendingOrdersHint = "Oldest: 1 day";
        //   } else {
        //     pendingOrdersHint = `Oldest: ${ageInDays} days`;
        //   }
        // }
        // setPendingOrders({
        //   value: formatNumber(pendingOrdersCountValue),
        //   hint: pendingOrdersHint,
        //   loading: false,
        // });

        // // Process total orders stats
        // const totalOrdersCurrentCount = totalOrdersCurrent.count || 0;
        // const totalOrdersLastMonthCount = totalOrdersLastMonth.count || 0;
        // const totalOrdersChange = totalOrdersCurrentCount - totalOrdersLastMonthCount;
        // const totalOrdersPercentChange =
        //   totalOrdersLastMonthCount > 0
        //     ? ((totalOrdersChange / totalOrdersLastMonthCount) * 100).toFixed(1)
        //     : "0.0";
        // const totalOrdersSign = totalOrdersChange >= 0 ? "+" : "";
        // const totalOrdersHint = `${totalOrdersSign}${totalOrdersPercentChange}% this month`;
        // setTotalOrders({
        //   value: formatNumber(totalOrdersCurrentCount),
        //   hint: totalOrdersHint,
        //   loading: false,
        // });

        // Process event attendance stats
        const eventAttendanceCurrentCount = eventAttendanceCurrent.count || 0;
        const eventAttendanceLastMonthCount = eventAttendanceLastMonth.count || 0;
        const eventAttendanceChange = eventAttendanceCurrentCount - eventAttendanceLastMonthCount;
        const eventAttendancePercentChange =
          eventAttendanceLastMonthCount > 0
            ? ((eventAttendanceChange / eventAttendanceLastMonthCount) * 100).toFixed(1)
            : "0.0";
        const eventAttendanceSign = eventAttendanceChange >= 0 ? "+" : "";
        const eventAttendanceHint = `${eventAttendanceSign}${eventAttendancePercentChange}% past 30 days`;
        setEventAttendance({
          value: formatNumber(eventAttendanceCurrentCount),
          hint: eventAttendanceHint,
          loading: false,
        });
      } catch (error) {
        console.error("Error in fetchAllStats:", error);
        setMembers({ value: "0", hint: "", loading: false });
        setAdmins({ value: "0", hint: "", loading: false });
        setEvents({ value: "0", hint: "", loading: false });
        // setPendingOrders({ value: "0", hint: "", loading: false });
        // setTotalOrders({ value: "0", hint: "", loading: false });
        setEventAttendance({ value: "0", hint: "", loading: false });
      }
    };

    fetchAllStats();
  }, []);

  return {
    "Active Members": members,
    Admins: admins,
    "Upcoming Events": events,
    "Monthly Attendance": eventAttendance,
    // "Pending Orders": pendingOrders,
    // "Total Orders": totalOrders,
  };
}
