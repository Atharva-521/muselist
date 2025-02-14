import { Music, ThumbsUp, Share2 } from "lucide-react"

export default function FeatureList() {
  const features = [
    {
      icon: <Music className="w-12 h-12 text-purple-600" />,
      title: "Add Music",
      description: "Easily add your favorite tracks to your personal playlist.",
    },
    {
      icon: <ThumbsUp className="w-12 h-12 text-purple-600" />,
      title: "Upvote Streams",
      description: "Like and upvote streams to push them up the queue.",
    },
    {
      icon: <Share2 className="w-12 h-12 text-purple-600" />,
      title: "Share Playlists",
      description: "Share your curated playlists with friends and the community.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

