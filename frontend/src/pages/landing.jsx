import React  from "react";
import "../App.css";
import { Link, useNavigate} from "react-router-dom";
import { Menu, VideoCall } from "@mui/icons-material";





export default function LandingPage() {

    const router = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);


    return (
        <div className="landingPageContainer">
           
            <nav>
                <h2>
                    <VideoCall/>
                    ConnectX
                </h2>
                <div className="menuIcon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu/>
                </div>

               
                <div className={`navList ${isMenuOpen ? "showMenu" : ""}`}>
                    <div className="navItem" onClick={() => {
                        router("/rendom")
                    }}>
                        Join as Guest
                    </div>
                    <div className="navItem login" onClick={() => {
                        router("/auth")
                    }}>
                        Sign In
                    </div>
                     <div className="navItem logout" onClick={() => {
                        router("/")
                    }}>
                        Logout
                    </div>
        
                </div>
            </nav>
           
            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color: "#FF9839"}}>Connect</span> with your loved ones</h1>
                    <p>Cover a distance by ConnectX Video Call</p>
                    <div role="button">
                        <Link to= {"/auth"}>Get Started</Link>
                    </div>
                    
                </div>
                <div>
                    <img src="/mobilebg.png" alt="" />
                </div>
            </div>
        </div>
    )
}