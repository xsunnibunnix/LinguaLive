const getMediaStream = async () => {
  // const [myStream, setMyStream] = useState<MediaStream | null>(null);
  // const isStreamSet = useRef(false);
  
  // useEffect(() => {
  //   if (isStreamSet.current) return;
  //   isStreamSet.current = true;

  //   const initStream = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         // audio: true,
  //         video: true,
  //       })
  //       console.log('setting your stream');
  //       setMyStream(stream)
  //     } catch (error) {
  //       console.log('Error in media navigator', error);
  //     }
  //   }
  //   initStream();
  // }, []);

  // return myStream;


  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      // audio: true,
      video: true,
    })
    console.log('setting your stream');
    return stream;
  } catch (error) {
    console.log('Error in media navigator', error);
    return null;
  }
}

export default getMediaStream;