export const BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const getURL = (path = "") => {
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
