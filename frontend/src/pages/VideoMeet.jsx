import { use, useEffect, useRef, useState } from "react";
import { Badge, Button, Card, CardContent, IconButton, TextField, Typography } from "@mui/material";
import io from "socket.io-client";
import styles from "../styles/VideoComponent.module.css";
import nav from "../styles/NavbarComponent.module.css";
import { CallEnd, Chat, Home, Mic, MicOff, ScreenShare, Send, StopScreenShare, Telegram, VideoCall, Videocam, VideocamOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";




const server_url = "http://localhost:8080"

const connections = {};


const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModel, setShowModel] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    let routeTo = useNavigate();

    let [focusedVideoId, setFocusedVideoId] = useState(null);



    useEffect(() => {
        getPermissions();
    }, [])


    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});

            if(videoPermission){
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});

            if(audioPermission){
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);

            } else {
                setScreenAvailable(false);
            }

            if(videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});
           
                 if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
           
           
            }
        } catch (e) {
            console.log(e);
        }
    }

   

    useEffect(() => {
        if(video !== undefined && audio !== undefined){
            getUserMedia();
        }
    }, [video, audio])

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);

        connectToSocketServer();
    }

    



    let getUserMediaSuccess = (stream) => {
            try {
                window.localStream.getTracks().forEach(track => track.stop())
            } catch (error) {
                console.log(error)
            }

            window.localStream = stream
            localVideoRef.current.srcObject = stream

            for(let id in connections){
                if(id === socketIdRef.current) continue

                connections[id].addStream(window.localStream) 

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                    .then(()=>{
                        socketRef.current.emit("signal", id, JSON.stringify({"sdp" : connections[id].localDescription}))
                    })
                    .catch(e => console.log(e))
                })
            }
          stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

             try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                window.localStream = blackSilence();
                localVideoRef.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
          })  
    } 

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let getUserMedia = () => {
        if((video && videoAvailable) || (audio && audioAvailable) ){
            navigator.mediaDevices.getUserMedia({video: video, audio: audio})
            .then(getUserMediaSuccess) 
            .then((stream) => { })
            .catch((e) =>  console.log(e))
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (e) {
                console.log(e);
            }
        }
    }

  

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if(fromId !== socketIdRef.current){
            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    
                    if(signal.sdp.type === "offer"){
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({'sdp' : connections[fromId].localDescription }))
                            }).catch((e) => console.log(e))
                        }).catch((e) => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if(signal.ice){
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
                .catch(e => console.log(e))
            }
        }
    }

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {sender : sender, data : data }
        ])

        if(socketIdSender !== socketIdRef.current){
            setNewMessages((prevNewMessages) => prevNewMessages + 1)
        }
    }


    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false})

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on("connect" , () => {
            socketRef.current.emit("join-call", window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on("chat-message", addMessage)

            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

                    connections[socketListId].onicecandidate = function (event)  {
                        if(event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({'ice' : event.candidate}))
                        }
                    }

        
                    //wait
                    connections[socketListId].onaddstream = (event) => {

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId)

                        if(videoExists){
                            //update existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video => 
                                    video.socketId === socketListId ? {...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            
                            let newVideo = {
                                socketId : socketListId,
                                stream : event.stream,
                                autoPlay: true,
                                playsinline: true
                            };
                            
                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    if(window.localStream !== undefined && window.localStream !== null){
                        connections[socketListId].addStream(window.localStream)
                    } else {

                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence();

                        connections[socketListId].addStream(window.localStream);

                    }

                })

                if(id === socketIdRef.current){
                    for(let id2 in connections){
                        if(id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) {}


                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                            .then(()=>{
                                socketRef.current.emit("signal", id2, JSON.stringify({"sdp" : connections[id2].localDescription}))
                            })
                            .catch((e) => console.log(e))
                        })
                    }   
                }
            })
        })
    }


    let handleVideo = () => {
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio);
    }

    let getDisplayMediaSuccess = (stream) =>{
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (error) {
            console.log(error);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description)=> [
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                })
                .catch(e => console.log(e))
            ])
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

             try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                window.localStream = blackSilence();
                localVideoRef.current.srcObject = window.localStream

            getUserMedia();
          }) 
    }

    let getDisplayMedia = () => {
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
                .then(getDisplayMediaSuccess)
                .then((stream) => { })
                .catch(e => console.log(e))
            }
        }
    }

    useEffect(() => {
        if(screen !== undefined){
            getDisplayMedia();
        }
    }, [screen])

    let handleScreen = () =>{
        setScreen(!screen);
    }

    let sendMessage = () => {
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    }
  
    let handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        routeTo("/home");
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

  

    return(

        <div>
            <div className={nav.navBar} >
                <h3>
                    <VideoCall/>
                    ConnectX
                </h3>
                <IconButton onClick={() => {
                        routeTo("/home")
                    }}>
                    <Home/>
                </IconButton>
            </div>
            { askForUsername === true ?

           <div className={styles.mainArea}>
                <div className="styles.leftArea">
                    <div>
                        <h2 style={{marginLeft:"20px"}}>Enter into Video Chat Room</h2>
                        <div style={{display: "flex", marginTop:"20px",gap:"10px",marginLeft:"20px"}}>
                            <TextField id="outlined-basic" label="username" value ={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                            <Button variant="contained" onClick={connect}>Connect</Button>
                        </div>
                    </div> 
                </div>
                <div className={styles.videoArea}>
                      <video ref={localVideoRef} autoPlay muted></video>
                </div>   
           </div> : 

           <div className={styles.meetVideoContainer}>

           {showModel ? <div className={styles.chatRoom}>

                    <div className={styles.chatContainer}>
                        <h1>Chat</h1>
                        <div className={styles.chatingDisplay}>

                            { messages.length > 0 ? messages.map((item, idx) => {
                                return(
                                    <div key={idx}  className={styles.chatCard}>
                                    <Card variant="outlined" className={styles.chatArea}>
                                        <CardContent>   
                                            <Typography  sx={{ fontSize: 14, fontWeight: 600 }} color="text.secondary">
                                                 {item.data}
                                            </Typography>
                                            <Typography variant="body2" color="text.primary">
                                                {item.sender}
                                            </Typography>

                                        </CardContent>
                                    </Card>
                                    </div>
                                )
                            })  : <p>No Messages Yet</p> }

                        </div>

                        <div className={styles.chatingArea}>
                            <TextField value={message} onChange={e => setMessage(e.target.value)} id="outlined-basic" label="Enter Your Message" variant="outlined" />

                            <Button variant="contained" 
                            endIcon={<Send />}
                            onClick={sendMessage}
                            >
                                 Send
                            </Button>
                        </div>

                    </div>
                    
            </div> : <></>} 

            <div className={styles.buttonContainers}>
                <IconButton  onClick={handleVideo} style={{color: "white"}}>
                    {(video === true) ? <Videocam /> : <VideocamOff />}
                </IconButton>
                <IconButton onClick={handleEndCall} style={{color: "#fc0341"}}>
                    <CallEnd />
                </IconButton>
                <IconButton onClick={handleAudio} style={{color: "white"}}>
                    {audio === true ? <Mic/> : <MicOff/>}
                </IconButton>

                {screenAvailable === true ?
                <IconButton  onClick={handleScreen} style={{color: "white"}} >
                    {screen === true ? <ScreenShare /> : <StopScreenShare/>}
                </IconButton> : <></>}

                <Badge badgeContent={Number.isNaN(newMessages) ? 0 : newMessages} max={999} color ='secondary'>
                    <IconButton 
                        onClick={() => {
                            setShowModel(!showModel);
                            if(!showModel){
                                setNewMessages(0);
                            }
                        } } 
                        
                        style={{color: "white"}}>
                            <Chat/> 
                    </IconButton>
                </Badge>

            </div>

            <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>

                <div className={styles.conferenceView}>
                {videos.map((video) => (
                    <div 
                        className={`${styles.videoViews} ${
                            focusedVideoId === video.socketId ? styles.focusedVideo : ""
                        }`} 
                        key= {video.socketId}
                        onClick={() => setFocusedVideoId(
                            focusedVideoId === video.socketId ? null : video.socketId
                        )}
                    >
                        
                        <video
                            
                            data-socket = {video.socketId}

                            ref = {ref => {
                                if(ref && video.stream){
                                    ref.srcObject = video.stream;
                                }
                            }}
                            autoPlay
                            playsInline
                          >
                        </video>
                        

                    </div>
                ))}
                </div>

           </div>
           

           }

        

               
        </div>
    )
}