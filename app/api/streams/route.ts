import { NextRequest, NextResponse } from "next/server";
import {z} from "zod"
import {prismaClient} from '@/app/lib/db';
//@ts-ignore 
import youtubesearchapi from 'youtube-search-api'
import { YT_REGEX } from "@/app/lib/utls";
import { getServerSession } from "next-auth/next";;
import { authOptions } from "../auth/[...nextauth]/authOptions";



const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string() //restring url to contain youtube or spotify
})

export async function POST(req: NextRequest){
    const session = await getServerSession(authOptions);
    console.log("post session : ", session);

    try{
        const data = CreateStreamSchema.parse(await req.json());
        const isYt = data.url.match(YT_REGEX);


        if (!isYt){
            return NextResponse.json({
                message: "Wrong url format"
            }, {
                status: 411
            })
        }

        const extractedId = data.url.split("?v=")[1];

        const res = await youtubesearchapi.GetVideoDetails(extractedId)
        //console.log(res)
        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a: {width: number},b: {width: number}) => a.width < b.width ? -1 : 1);
        
        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                url: data.url,
                extractedId: extractedId,
                type: "Youtube",
                title: res.title ?? 'cant find video',
                bigImg: thumbnails[thumbnails.length - 1].url ?? "",
                smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ?? ""
                
            }
        });

        return NextResponse.json({
            ...stream,
            hasUpvoted: false,
            upvotes: 0
        });

    }catch(e: any){
        console.log(e.message);
        return NextResponse.json({
            message: "Error while addding a stream"
        }, {
            status: 411
        })
    }
}

export async function GET(req: NextRequest){
    const creatorId = req.nextUrl.searchParams.get('creatorId');

    const session = await getServerSession(authOptions);
    console.log("Session : ", session);

    const user = await prismaClient.user.findFirst({
        where:{
            email: session?.user?.email ?? ""
        }
    });

    if(!user){
        return NextResponse.json({
            message: "Unauthenticated",
            session: session
        },{
            status: 403
        })
    }
    if(!creatorId){
        return NextResponse.json({
            message: "Error"
        },{
            status: 411
        })
    }

    const [streams, activeStream] = await Promise.all([await prismaClient.stream.findMany({
        where: {
            userId: creatorId,
            played: false
        },
        include: {
            _count: {
                select: {
                    upvotes: true
                }
            },
            upvotes: {
                where: {
                    userId: user.id
                }
            }
        }
    }), await prismaClient.currentStream.findFirst({
        where: {
            userId: creatorId
        },
        include: {
            stream: true
        }
    })])

    return NextResponse.json({
        streams : streams.map(({_count, ...rest} : any) => ({
            ...rest,
            upvoteCount: _count.upvotes, 
            haveUpvoted: rest.upvotes.length ? true : false
        })),
        activeStream
    }); 
}

