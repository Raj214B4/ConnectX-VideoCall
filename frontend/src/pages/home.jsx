import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import styles from "../styles/HomeComponent.module.css"
import nav from "../styles/NavbarComponent.module.css";
import {  Restore, VideoCall } from "@mui/icons-material";
import { IconButton, Button, TextField } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {

    let navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");

    const {handleAddHistory} = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        await handleAddHistory(meetingCode)
        navigate(`/${meetingCode }`);
    }

    
 



    return (
        <>
            <div className={nav.navBar}>

                <div>
                    
                    <h3>
                        <VideoCall/>
                        ConnectX
                    </h3>
                </div>

                <div  > 
                    <IconButton onClick={() =>{
                        navigate("/history")
                    }}>
                        <span>
                            <Restore/>
                        </span>
                        
                        <p style={{fontSize: "16px", margin:"8px"}}>History</p>
                    </IconButton>
                     <Button className={nav.logoutBtn} onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>
                       Logout
                    </Button >
                    
                </div>
            </div>

            <div className={styles.meetContainer}>
                <div className={styles.leftPanel}>
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>
                        <div style={{display: "flex", gap: "10px", marginTop: "16px"}}>
                            <TextField onChange={e => setMeetingCode(e.target.value) } id="outlined-basic" label="Meeting Code " variant="outlined"  ></TextField>
                            <Button onClick={handleJoinVideoCall} variant="contained">Join</Button>
                        </div>
                    </div>

                </div>
                 <div className={styles.rightPanel}>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
           
        </>
    )
} 

export default withAuth(HomeComponent);