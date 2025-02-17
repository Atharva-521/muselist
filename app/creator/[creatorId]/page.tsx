import StreamView from "@/app/components/StreamView"


const Creator = async (props: { params: Promise<{ creatorId: string }> }) => {
    const { creatorId } = await props.params;
    return <div className="w-full h-full">
        <StreamView creatorId={creatorId} playVideo={true} />
    </div>
}

export default Creator;