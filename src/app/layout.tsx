import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Fort Curieux",
	description: "Entraînez votre corps. Entretenez votre culture.",
	applicationName: "Fort Curieux",
	manifest: "/manifest.webmanifest",
	appleWebApp: {
		capable: true,
		title: "Fort Curieux",
		statusBarStyle: "black-translucent",
	},
	icons: {
		icon: [{ url: "/icon.png", type: "image/png" }],
		apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#07111f",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr">
			<body>{children}</body>
		</html>
	);
}
