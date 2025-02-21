import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const sansFont = DM_Sans({
	variable: "--font-sans",
	subsets: ["latin"],
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
		<html lang="en" className={`${sansFont.variable}`}>
			<body className="antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
