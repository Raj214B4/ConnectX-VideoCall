import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardActions, CardContent, Container, IconButton, Snackbar, Typography } from "@mui/material";
import { Delete, Home, VideoCall } from "@mui/icons-material";
import nav from "../styles/NavbarComponent.module.css";


export default function HistoryComponent (){

    const { handleUserHistory, handleDeleteHistory  } = useContext(AuthContext);
    const [ meetings, setMeetings ] = useState([]);
    const routeTo = useNavigate();
    const [open , setOpen] = useState(false);
    const [message, setMessage] = useState("");


    useEffect(()=>{
        const fetchHistory = async() => {
            try {
                let history = await handleUserHistory();
                setMeetings(history);
            } catch (e) {
              throw e;
                
            }
        }
        fetchHistory();
    },[])


    const deleteMeeting = async (meetingCode) => {
      try {
        const res = await handleDeleteHistory(meetingCode);

        setMessage(res.message);
        setOpen(true)

        setMeetings(meetings.filter(m => m.meetingCode !== meetingCode));
        
      } catch (err) {
        throw err;

        setMessage("failed to delete meeting history!")
        setOpen(true)
      }
    }

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");


        return `${day}/${month}/${year}  ${hours}:${minutes}`

    }

    return(
        <div>
            <div>
            <nav>
                <div className={nav.navBar}>
                    <h3>
                      <VideoCall/>
                      ConnectX
                    </h3>
                    <IconButton onClick={() => {
                      routeTo("/home")
                    }}>
                      <Home />   
                     </IconButton >
                </div>
                
            </nav>
            
            </div>
        <Container  maxWidth="sm" sx={{ mt: 8 }}>
        {meetings.length > 0 ? (
          meetings.map((e, idx) => (
            <div key={idx} sx={{ mb: 2 }} className={nav.historyBox}>
              <Card variant="outlined" className={nav.cardView}>
                <CardContent>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }} color="text.secondary" gutterBottom>
                    MeetingCode: {e.meetingCode}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Date: {formatDate(e.date)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Box sx={{ marginLeft:"auto"}}>
                    <Button onClick={() => deleteMeeting(e.meetingCode)}  color="secondary" startIcon={<Delete />}>
                      delete
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </div>
          ))
        ) : (
          <Typography variant="body1" align="center" color="text.secondary">
            No Meeting History Available !
          </Typography>
        )}
      </Container>
               
               <Snackbar
                  open={open}
                  autoHideDuration={4000}
                  message = {message}
                  onClose={() => setOpen(false)}
               />
          
    </div>
  );
}
    
