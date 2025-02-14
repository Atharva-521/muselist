"use client"

import Appbar from "./components/Appbar"
import Hero from "./components/Hero"
import FeatureList from "./components/FeatureList"
import CallToAction from "./components/CallToAction"
import connectSocket from "./lib/ws"


export default function Home() {
  connectSocket();
  return (
    <div className="w-full min-h-screen bg-gray-100">
      <Appbar />
      <main>
        <Hero />
        <FeatureList />
        <CallToAction />
      </main>
    </div>
  )
}

