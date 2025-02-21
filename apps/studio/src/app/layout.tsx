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
