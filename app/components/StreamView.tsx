"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpCircle, Play, Plus } from 'lucide-react'
import { YT_REGEX } from "../lib/utls"
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

interface Video {
    "id": string,
    "type": string,
    "url": string,
    "extractedId": string,
    "title": string,
    "smallImg": string,
    "bigImg": string,
    "active": boolean,
    "userId": string,
    "upvotes": number,
    "haveUpvoted": boolean
}

const REFRESH_INTERVAL_MS = 10 * 1000;

const refresh = () => {

}

export default function StreamView({ creatorId, playVideo = false }: { creatorId: string, playVideo: boolean }) {
    const [queue, setQueue] = useState<Video[]>([])
    const [nowPlaying, setNowPlaying] = useState<Video | null>(null)
    const [newVideoTitle, setNewVideoTitle] = useState("")
    const [previewVideo, setPreviewVideo] = useState<Video | null>(null)
    const [inputLink, setInputLink] = useState('');


    const refreshStreams = async () => {
        try {
            const res = await fetch(`/api/streams/?creatorId=${creatorId}`,
                {
                    credentials: "include"
                }
            );

            const json = await res.json();

            setQueue(json.streams.sort((a: any, b: any) => a.upvotes < b.upvotes ? 1 : -1));

            setNowPlaying(video => {
                if (video?.id === json.activeStream?.stream?.id) {
                    return video;
                }
                return json.activeStream?.stream?.id
            })
        } catch (e) {
            console.log("error : ", e);
        }
    }

    useEffect(() => {
        refreshStreams();
        const interval = setInterval(() => {
            refreshStreams()
        }, REFRESH_INTERVAL_MS)
    }, []);

    useEffect(() => {
        if (newVideoTitle.trim()) {
            setPreviewVideo({
                id: "preview",
                title: newVideoTitle.trim(),
                votes: 0,
                thumbnail: `/placeholder.svg?height=90&width=120&text=${encodeURIComponent(newVideoTitle.trim())}`,
            })
        } else {
            setPreviewVideo(null)
        }
    }, [newVideoTitle])

    const addToQueue = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/streams', {
            method: "POST",
            body: JSON.stringify({
                creatorId,
                url: inputLink
            })
        });
        console.log('res', res);
        const data = await res.json();
        setQueue((prevQueue: any) => [...prevQueue, data])
        setNewVideoTitle("")
    }


    const upvote = (id: string) => {
        setQueue((prevQueue) =>
            prevQueue.map((video) =>
                video.id === id ? { ...video, votes: video.votes + 1 } : video
            )
        )
    }

    const playNext = () => {
        if (queue.length > 0) {
            const nextVideo = queue.reduce((prev, current) =>
                prev.votes > current.votes ? prev : current
            )
            setNowPlaying(nextVideo)
            setQueue((prevQueue) => prevQueue.filter((video) => video.id !== nextVideo.id))
        }
    }

    console.log("queue", queue);

    return (
        <div className="p-4 w-[100%] bg-gradient-to-b from-purple-100 to-blue-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center text-purple-800">Music Streaming Platform</h1>
            <div className="grid grid-cols-2 w-[80%] mx-auto gap-10">
                {/* Queue */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-purple-800">Queue</h2>
                    {queue?.length === 0 ? (
                        <p className="text-gray-500">Queue is empty</p>
                    ) : (
                        <ul className="space-y-4">
                            {queue?.map((video) => (
                                <li key={video.id} className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-md">
                                    <img
                                        src={video.smallImg}
                                        alt={`Thumbnail for ${video.title}`}
                                        className="w-30 h-20 object-cover rounded"
                                    />
                                    <div className="flex-grow">
                                        <h3 className="font-medium text-purple-800">{video.title}</h3>
                                        <div className="flex items-center mt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => upvote(video.id)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <ArrowUpCircle className="h-5 w-5 mr-1" />
                                                Upvote
                                            </Button>
                                            <span className="ml-2 text-sm text-gray-600">{video.votes} votes</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    {/* Add to Queue Form */}
                    <form onSubmit={addToQueue} className="mb-6">
                        <div className="flex gap-2 mb-2">
                            <Input
                                type="text"
                                value={inputLink}
                                onChange={(e) => setInputLink(e.target.value)}
                                placeholder="Enter video title"
                                className="flex-grow bg-white"
                            />
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add to Queue
                            </Button>
                        </div>
                        {inputLink && inputLink.match(YT_REGEX) && (
                            <div className="mt-2 p-2 bg-white rounded-md shadow-md ">

                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-md">
                                    <LiteYouTubeEmbed id={inputLink.split('?v=')[1]} title="" />
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Now Playing */}
                    <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <CardContent className="p-4">
                            <h2 className="text-xl font-semibold mb-2">Now Playing</h2>
                            {nowPlaying ? (
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={nowPlaying.thumbnail || "/placeholder.svg"}
                                        alt={nowPlaying.title}
                                        width={120}
                                        height={90}
                                        className="rounded-md"
                                    />
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2">
                                            <Play className="h-6 w-6" />
                                            <span className="text-lg font-medium">{nowPlaying.title}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p>No video playing</p>
                            )}
                        </CardContent>
                    </Card>

                    {
                        <Button
                            onClick={playNext}
                            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                            disabled={queue.length === 0}
                        >
                            Play Next
                        </Button>
                    }

                </div>


            </div>

            {/* Play Next Button */}

        </div>
    )

}
