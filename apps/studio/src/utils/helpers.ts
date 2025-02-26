const BASE_URL =
	(process.env.NEXT_PUBLIC_VERCEL_ENV === "production" &&
		`https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`) ||
	(process.env.NEXT_PUBLIC_VERCEL_URL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`) ||
	"http://localhost:3000";

export const getURL = (path = "") => {
	console.log({
		NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
		NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
			process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
		NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
		BASE_URL: BASE_URL,
	});

	return new URL(path, BASE_URL).toString();
};

const toastKeyMap: { [key: string]: string[] } = {
	status: ["status", "status_description"],
	error: ["error", "error_description"],
};

const getToastRedirect = (
	path: string,
	toastType: string,
	toastName: string,
	toastDescription?: string,
	disableButton?: boolean,
	arbitraryParams?: string,
): string => {
	const [nameKey, descriptionKey] = toastKeyMap[toastType];

	let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

	if (toastDescription) {
		redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`;
	}

	if (disableButton) {
		redirectPath += "&{disable_button=true}";
	}

	if (arbitraryParams) {
		redirectPath += `&${arbitraryParams}`;
	}

	return redirectPath;
};

export const getStatusRedirect = (
	path: string,
	statusName: string,
	statusDescription?: string,
	disableButton?: boolean,
	arbitraryParams?: string,
) =>
	getToastRedirect(path, "status", statusName, statusDescription, disableButton, arbitraryParams);

export const getErrorRedirect = (
	path: string,
	errorName: string,
	errorDescription?: string,
	disableButton?: boolean,
	arbitraryParams?: string,
) => getToastRedirect(path, "error", errorName, errorDescription, disableButton, arbitraryParams);

export const capitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const titleCase = (str: string) => {
	return str.replace(/\b\w/g, (char) => char.toUpperCase());
};
