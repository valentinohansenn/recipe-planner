import type { Metadata } from "next"
import {
	Funnel_Sans,
	Geist,
	Geist_Mono,
	Outfit,
	Plus_Jakarta_Sans,
	Space_Grotesk,
} from "next/font/google"
import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
})

const funnelSans = Funnel_Sans({
	variable: "--font-funnel-sans",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Recipe Planner - AI-Powered Recipe Generator",
	description:
		"Create perfect recipes with AI assistance. Get personalized cooking instructions, ingredient lists, and helpful tips.",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${funnelSans.variable} font-sans antialiased`}
			>
				{children}
			</body>
		</html>
	)
}
