import { getPagePortalSession } from "@/utils/portal/session";

export default async function PortalPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { url } = await getPagePortalSession({ searchParams });

	return (
		<a
			href={url("/portal/auth/initiate?integration_id=00000000-0000-0000-0000-000000000000")}
			className="m-4 px-3 py-1 inline-block rounded-sm bg-blue-600 font-bold text-white"
		>
			Initiate Session
		</a>
	);
}
