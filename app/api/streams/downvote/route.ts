import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const data = UpvoteSchema.parse(await req.json());
    
    // ToDO: You can get rid of the db call here
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });
    
    //TODO: Replace this with id everywhere
    if (!user) {
        return NextResponse.json({
            message: "Unaunthicated"
        },{
            status: 403
        })
    }

    await prismaClient.upvote.delete({
        where : {

            //We used this bcz we defined userId and streamId combination unique in upvote schema
            userId_streamId:{
                userId: user.id,
                streamId: data.streamId
            }
        }
    });
  } catch (e) {
    return NextResponse.json({
        message: "Error while upvoting"
    }, {
        status: 403
    })
  }
}
