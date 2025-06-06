import * as React from 'react';
import nav from "../styles/NavbarComponent.module.css";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';

import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { IconButton, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, VideoCall } from '@mui/icons-material';





const defaultTheme = createTheme();

export default function Authentication() {

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const [fromState, setFromState] = React.useState(0);

    const [open, setOpen] = React.useState(false);

    const {handleRegister, handleLogin} = React.useContext(AuthContext);

    const routeTo = useNavigate();

    let handleAuth = async () => {
      try{
        if(fromState === 0){
          let result = await handleLogin(username, password);
          setUsername("");
          setPassword("");
        }
        if(fromState === 1){
          let result = await handleRegister(name, username, password);
          console.log(result);
          setUsername("");
          setMessage(result);
          setOpen(true);
          setError("")
          setFromState(0)
          setPassword("");
        }
      } catch (err){
        console.log(err);
        let message = (err?.response?.data?.message || "something went wrong");
        setError(message);
      }
    }



  return (
  <div>
    

    <ThemeProvider theme={defaultTheme}>
      <Grid container
        sx={{
          left: 0,
          right: 0,
          top: 0,
          position: 'fixed'
        }}
      >
      <div className={nav.navBar}>
      <h3> 
        <VideoCall/>
        ConnectX
      </h3>
      <IconButton onClick={() => {
        routeTo("/")
      }}>
        <Home/>
      </IconButton>
    </div>
     </Grid>
      <Grid 
        container 
        component="main" 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection:'row',
          justifyContent:'flex-end',
        }}>
                <CssBaseline />
                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={6}
                    sx={{
                        width: '70%%',
                        height: '80vh',
                        backgroundImage: 'url(/auth.png)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexGrow: 1,
                        marginTop: '54px'
                    }}
                   
                />
            
                <Grid item xs={12} sm={6} md={6} component={Paper} elevation={6}>
                    <Box
                        sx={{
                            my: 20,
                            mx: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginTop:'54px',
                            height: 'clac(100vh - 54px)',
                            justifyContent: 'center'
                           
                        }}
                    >
                        <Avatar sx={{ m: 5, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

            <div>
                <Button variant={fromState === 0 ? "contained" : " "} onClick={ () => {setFromState(0)}} >
                    Sign In
                </Button>
                <Button variant={fromState === 1 ? "contained" : " "} onClick={ () => {setFromState(1)}} >
                    Sign Up
                </Button>
            </div>
            <Box component="form" noValidate  sx={{ mt: 1 }}>
                {fromState === 1 ? <TextField
                margin="normal"
                required
                fullWidth
                id="fullname"
                label="Full Name"
                name="fullname"
                value={name}
                autoFocus
                onChange={ (e) => setName(e.target.value)}
              /> : <></>}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus
                onChange={ (e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}

                onChange={ (e) => setPassword(e.target.value)}
              />
              <p style={{color: "red"}}> {error}</p>
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {fromState === 0 ? "Login" : "Register"}
              </Button>
             
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      

              <Snackbar 
                open ={open}
                autoHideDuration={4000}
                message = {message}
                onClose={() => setOpen(false)}
              />


    </ThemeProvider>

    </div>
  );
}