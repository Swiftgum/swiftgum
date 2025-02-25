import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { DM_Mono, DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const sansFont = DM_Sans({
	variable: "--font-sans",
	subsets: ["latin"],
});

const monoFont = DM_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
	weight: ["400", "500"],
});

const serifFont = DM_Serif_Display({
	variable: "--font-serif",
	subsets: ["latin"],
	weight: ["400"],
});

export const metadata: Metadata = {
	title: "Swiftgum",
	icons: {
		icon: [
			{ url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon.ico" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
	},
	manifest: "/site.webmanifest",
	appleWebApp: {
		title: "MyWebSite",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${sansFont.variable} ${monoFont.variable} ${serifFont.variable}`}>
			<body className="antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
