import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import styles from "../styles/HomeComponent.module.css"
import nav from "../styles/NavbarComponent.module.css";
import {  MoreVert, Restore, VideoCall } from "@mui/icons-material";
import { IconButton, Button, TextField } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {

    let navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");

    const {handleAddHistory} = useContext(AuthContext);

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    let handleJoinVideoCall = async () => {
        await handleAddHistory(meetingCode)
        navigate(`/${meetingCode }`);
    }

    
 



    return (
        <div className={styles.homepage}>
            <nav>
                    <h2>
                        <VideoCall/>
                        ConnectX
                    </h2>
                
                <div className={styles.menuicon}  onClick={() => setIsMenuOpen(!isMenuOpen)} >
                    <MoreVert/>
                </div>
                <div  className={`${styles.navlist} ${isMenuOpen ? styles.showMenu : ""}`} > 
                    <div className={styles.navitem }onClick={() => {
                        navigate("/history")
                    }}>
                        <h4><span><Restore/></span> History</h4>
                           
                    </div>
                    <div className={styles.logoutbtn} onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>
                        Logout
                    </div>
                    
                </div>
                
           </nav>

            <div className={styles.meetContainer}>
                <div className={styles.leftPanel}>
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>
                        <div style={{display:"flex",alignItems:"flex-start",flexDirection:"column",marginTop:"16px",gap:"12px",}}>
                            <TextField 
                            onChange={e => setMeetingCode(e.target.value) } 
                            id="outlined-basic" 
                            label="Meeting Code " 
                            variant="outlined"
                            InputProps={{style:{
                                color:"#fff",
                                fontSize:"1.2rem"
                            }}}  
                            InputLabelProps={{style:{
                                color:"#fff"
                            }
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: "white",   
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#fff",   
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#fff",    
                                    }
                                }
                            }}
                               
                            ></TextField>
                            <Button 
                            onClick={handleJoinVideoCall} 
                            variant="contained"
                            style={{ 
                                backgroundColor: "#ff7142", 
                                color: "#fff",
                                fontSize:"1rem",
                                minWidth: "110px",
                                padding:"10px 16px"
                            }}
                            >Join</Button>
                        </div>
                    </div>

                </div>
                 <div className={styles.rightPanel}>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
           
        </div>
    )
} 

export default withAuth(HomeComponent);