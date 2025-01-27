import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { tree } from "next/dist/build/templates/app-page";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest){
    const session = await getServerSession();

    const user = await prismaClient.user.findFirst({
        where:{
            email: session?.user?.email ?? ""
        }
    });

    if(!user){
        return NextResponse.json({
            message: "Unauthenticated"
        },{
            status: 403
        })
    }

    const [streams, activeStream] = await Promise.all([prismaClient.stream.findMany({
        where: {
            userId: user.id,
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
                    userId: user?.id
                }
            }
        }


    }), prismaClient.currentStream.findFirst({
        where: {
            userId: user.id
        },
        include: {
            stream: true
        }
    })]);

    // const streams = await prismaClient.stream.findMany({
    //     where:{
    //         userId: user.id  //TODO : Is this needed vcz if we fetch streams of logged in user then it will not show if user is upvoted or not in all stream instead it will only show if user is upvoted or not in the streams created by the user.
    //     },
    //     include:{
    //         _count: {
    //             select: {
    //                 upvotes: true
    //             }
    //         },
    //         upvotes:{   //fetch users all upvote to check user has upvoted this stream or not
    //             where: {
    //                 userId: user.id
    //             }
    //         }
    //     }
    // });

    return NextResponse.json({
        streams : streams.map(({_count, ...rest}) => ({
            ...rest,
            upvoteCount: _count.upvotes, 
            haveUpvoted: rest.upvotes.length ? true : false
        })),
        activeStream    
    }); 
}