// import DigitalWorkerTable from "@/components/organisms/DigitalWorkerTable"; // Client Component
// DigitalWorkerPage.tsx (Server Component)
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// type DigitalWorkerWithSequenceDigitalWorkerLeads = {
// 	configuration: any;
// 	created_at: string | null;
// 	id: string;
// 	name: string;
// 	status: string;
// 	trigger: string;
// 	type: string;
// 	user_id: string | null;
// 	sequence_digital_worker_leads: {
// 		status: "paused" | "scheduled" | "stopped" | "to_review" | "to_connect" | "completed";
// 	}[]; // Ensure this matches the fetched data structure
// };

export default async function DigitalWorkerPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/");

	//   const { data: subscription, error: errorSubscription } = await supabase
	//     .from('subscriptions')
	//     .select('*, prices(*, products(*))')
	//     .in('status', ['trialing', 'active'])
	//     .eq('user_id', user.id)
	//     .maybeSingle();

	// if (error) {
	// 	console.error("Error fetching digital_workers:", error);
	// 	return;
	// }

	//   if (process.env.NODE_ENV === 'development')
	//     console.log('Data:', digitalWorkers);

	return <div />;
}
