import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import SmoothFollower from "@/components/smooth-follower";
import DelicateAsciiDots from "@/components/delicate-ascii-dots";

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    metadataBase: new URL(DATA.url),
    title: {
        default: DATA.name,
        template: `%s | ${DATA.name}`,
    },
    description: DATA.description,
    keywords: [
        "Portfolio", 
        "Software Engineer", 
        "Frontend Developer", 
        "React Developer", 
        "NextJS", 
        "TypeScript", 
        ...DATA.skills
    ],
    openGraph: {
        title: {
            default: DATA.name,
            template: `%s | ${DATA.name}`,
        },
        description: DATA.description,
        siteName: DATA.name,
        url: DATA.url,
        type: "website",
        locale: "en_US",
        images: [
            {
                url: `${DATA.url}/api/og?title=${encodeURIComponent(DATA.name)}&description=${encodeURIComponent(DATA.description)}`,
                width: 1200,
                height: 630,
                alt: DATA.name,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: {
            default: DATA.name,
            template: `%s | ${DATA.name}`,
        },
        description: DATA.description,
        images: [`${DATA.url}/api/og?title=${encodeURIComponent(DATA.name)}&description=${encodeURIComponent(DATA.description)}`],
    },
    icons: {
        icon: [{ url: "/fav.png", sizes: "any", type: "image/png" }],
        shortcut: "/fav.png",
        apple: [{ url: "/fav.png", sizes: "any", type: "image/png" }],
    },
    verification: {
        google: "",
        yandex: "",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="light">
            <body className={cn("min-h-screen bg-background font-sans antialiased max-w-2xl mx-auto py-12 sm:py-24 px-6", fontSans.variable)}>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                    <DelicateAsciiDots lightBackgroundColor="#ffffff" darkBackgroundColor="#000000" lightTextColor="200, 200, 200" darkTextColor="100, 100, 100" gridSize={100} animationSpeed={0.75} removeWaveLine={true} />
                    <SmoothFollower />
                    <TooltipProvider delayDuration={0}>
                        {children}
                        <Navbar />
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
