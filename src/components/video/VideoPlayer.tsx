import ReactPlayer from 'react-player';

type VideoPlayerProps = {
  url: MediaStream | undefined
}

const VideoPlayer = ({url}: VideoPlayerProps) => {
  return (
    <>
      <ReactPlayer url={url} />
    </>
  )
}

export default VideoPlayer;