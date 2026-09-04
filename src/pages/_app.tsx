import Fotter from "@/Components/Fotter";
import Navbar from "@/Components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppProvider } from "@/context/AppContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider><div className="bg-white min-h-screen">
      <Navbar />
      <Component {...pageProps} />
      <Fotter/>
    </div></AppProvider>
  );
}
