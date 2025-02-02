import StreamView from "@/app/components/StreamView"


const Creator = ({
    params: {
        creatorId
    }
} : {
    params : {
        creatorId: string
    }
}) => {
    return <div className="w-full h-full">
        <StreamView creatorId={creatorId} playVideo={true} />
    </div>

}

export default Creator;