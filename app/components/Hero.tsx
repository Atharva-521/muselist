import Image from "next/image"

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Muselist</h1>
          <p className="text-xl mb-6">Create, share, and discover music playlists with a community of music lovers.</p>
          <button className="bg-white text-purple-600 font-bold py-2 px-4 rounded-full hover:bg-gray-200 transition duration-300">
            Get Started
          </button>
        </div>
        <div className="md:w-1/2">
          <Image src="/placeholder.svg" alt="Muselist App" width={500} height={300} className="rounded-lg shadow-lg" />
        </div>
      </div>
    </section>
  )
}

