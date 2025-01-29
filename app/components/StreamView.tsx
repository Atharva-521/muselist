"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle, Play, Plus, Send } from 'lucide-react'
import { YT_REGEX } from "../lib/utls"
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
//@ts-ignore
import YoutubePlayer from 'youtube-player';
import {toast, ToastContainer} from 'react-toastify';
import { Appbar } from "./Appbar"
import connectToWebSocket from "../lib/ws";


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
    "haveUpvoted": boolean,
    "upvoteCount": number
}

const REFRESH_INTERVAL_MS = 10 * 1000;



export default  function StreamView({ creatorId = '', playVideo = true }: { creatorId: string, playVideo: boolean }) {
    const [queue, setQueue] = useState<Video[]>([])
    const [nowPlaying, setNowPlaying] = useState<Video | null>(null)
    const [newVideoTitle, setNewVideoTitle] = useState("")
    const [previewVideo, setPreviewVideo] = useState<Video | null>(null)
    const [inputLink, setInputLink] = useState('');
    const [loading, setLoading] = useState(false);
    const videoPlayerRef = useRef<HTMLDivElement>(null);
    const [socket, setSocket] = useState<any>(null);
    const [cookies, setCookies] = useState<any>(null);

    useEffect(() => {
        const initializeSocket = async () => {
            const {socket, cookies} : any = await connectToWebSocket();
            console.log('cookies : ', cookies);
            setSocket(socket);
            setCookies(cookies);
        };

        initializeSocket();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const refreshStreams = async () => {
            try {
                socket.emit('getstreams', { creatorId, playVideo, cookies });
                socket.on('streamsData', function (data: any) {
                    console.log("data : ", data);
                    setQueue(data.streams.sort((a: any, b: any) => a.upvotes < b.upvotes ? 1 : -1));
                    setNowPlaying(video => {
                        if(video?.id ===data.activeStream?.stream?.id ){
                            return video;
                        }
                        return data.activeStream?.stream
                    })
                });
            } catch (e) {
                console.log("error : ", e);
            }
        };

        refreshStreams();
        const interval = setInterval(() => {
            refreshStreams();
        }, REFRESH_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [socket]);

    const addToQueue = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true);
        socket.emit('createstreams', {creatorId, inputLink});
        socket.on('streamCreated', function(data: any){
            setQueue((prevQueue: any) => [...prevQueue, data])
        })
        setLoading(false);
        setNewVideoTitle("")
        setInputLink("");
        
        // console.log('res', res);
        // setQueue((prevQueue: any) => [...prevQueue, data])
        
    }

    useEffect(() => {
        if(!videoPlayerRef.current){
            return;
        }

        let player = YoutubePlayer('ytplayer');
        console.log('player : ',player);

        player.loadVideoById(nowPlaying?.extractedId);

        player.playVideo();

        function eventHandler(event: any){
            console.log("state : ", event);
            if(event.data === 0){
                console.log("Inside");
                playNext();
            }
        };

        player.on('stateChange', eventHandler);

        return () => {
            player.destroy();
        }

    },[nowPlaying, videoPlayerRef])


    const handleVote = async (id: string, isUpvote: boolean) => {
        setQueue(prev => prev.map(video => (
            video?.id == id ? {
                ...video,
                upvoteCount: isUpvote ? video.upvoteCount + 1 : video.upvoteCount - 1,
                haveUpvoted: !video.haveUpvoted
            } : video
        )).sort((a, b) => (b.upvoteCount) - (a.upvoteCount)));

        socket.emit("handlevote", {id, isUpvote});

    }

    const playNext = async () => {
        if (queue.length >= 0) {
            try {
                const data: any = socket.emit("playnext");

                const json = await data.json();
                setNowPlaying(json.stream);
                setQueue(prev => prev.filter(elem => elem.id !== json.stream?.id));

            } catch (e) {

            }
        }
    }

    console.log("queue", queue);

    const handleShare = () => {
        const shareableLink = `${window.location.hostname}/creator/${creatorId}`
        navigator.clipboard.writeText(shareableLink).then(() => {
          toast.success('Link copied to clipboard!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
        }, (err) => {
          console.error('Could not copy text: ', err)
          toast.error('Failed to copy link. Please try again.', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
        })
      }
    

    return (
        <div className="p-4 w-[100%] bg-gradient-to-b from-purple-100 to-blue-100 min-h-screen">
            <Appbar />
            <div className="grid grid-cols-2 w-[80%] mx-auto gap-10">
                {/* Queue */}
                <div className="bg-white rounded-lg p-4 shadow-md  ">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold mb-4 text-purple-800">Queue</h2>
                       { playVideo ? <Button onClick={handleShare} className="bg-purple-600 hover:bg-purple-700 flex items-center">
                                <Send />
                                Share
                        </Button> : ''}
                    </div>
                    {queue?.length === 0 ? (
                        <p className="text-gray-500">Queue is empty</p>
                    ) : (
                        <ul className="space-y-4">
                            {queue?.map((video, index) => (
                                <li key={video.id + index} className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-md">
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
                                                onClick={() => handleVote(video.id, video.upvoteCount ? false : true)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                {
                                                    !video.haveUpvoted ? (<span className="flex">
                                                        <ArrowUpCircle className="h-5 w-5 mr-1" />
                                                        Upvote
                                                    </span>) : (<span className="flex"><ArrowDownCircle className="h-5 w-5 mr-1" /> downvote</span>)
                                                }

                                            </Button>
                                            <span className="ml-2 text-sm text-gray-600">{video.upvoteCount} votes</span>
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
                            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                                {loading ? "...Adding to Queue" : <div className="flex items-center"><Plus className="h-4 w-4 mr-2" />
                                    Add to Queue</div>}

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
                                <>
                                    <div id="ytplayer" ref={videoPlayerRef} className="w-full" />
                                    
                                </> 
                            ) : (
                                <p>No video playing</p>
                            )}
                        </CardContent>
                    </Card>

                    {
                        playVideo ? <Button
                            onClick={playNext}
                            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                            disabled={queue.length === 0}
                        >
                            Play Next
                        </Button> : ''
                    }

                </div>


            </div>

            <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
        />

        </div>
    )

}
