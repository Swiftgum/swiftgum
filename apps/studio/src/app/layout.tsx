import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { DM_Mono, DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Head from "next/head";

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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${sansFont.variable} ${monoFont.variable} ${serifFont.variable}`}>
			<Head>
				<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="shortcut icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<meta name="apple-mobile-web-app-title" content="MyWebSite" />
				<link rel="manifest" href="/site.webmanifest" />
			</Head>
			<body className="antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
