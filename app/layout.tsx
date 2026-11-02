import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"AI Remotion Studio — Ideas into Motion",description:"Create original stock motion graphics from a simple brief."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}