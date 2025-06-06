import { User } from "../models/user.model.js";
import bcrypt, {hash} from "bcrypt";
import httpStatus from "http-status";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";


const login = async (req, res) => {
    const { username, password} = req.body;

    if(!username || !password){
       return res.status(400).json({message: "Required"});
    }
    try {
        const user = await User.findOne({username});

        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message: " User Not Found Please Do SignUp"});
        }

        if( await bcrypt.compare(password, user.password)){
            let token =  crypto.randomBytes(20).toString("hex");
            user.token = token;

            await user.save();

            return res.status(httpStatus.OK).json({ token : token});
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid username or password"});
        }
        
    } catch (e) {
      return res.status(500).json({message: `Something went WRONG!${e}`});
    }
}

const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(httpStatus.FOUND).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword

        });

        await newUser.save();
        res.status(httpStatus.CREATED).json({message: "User Registered"});

    } catch (e) {
        return res.status(500).json({message: `Something went WRONG!${e}`});
    }
}


const getUserHistory = async (req, res) => {
   const {token} = req.query;

   try {
    const user = await User.findOne({token: token});
    console.log(token)
    if (!user) {
       return res.status(404).json({ message: "User not found with given token" });
     }
     const meetings = await Meeting.find({user_id: user._id})
     console.log(user._id);
     res.json(meetings);
    
   } catch (error) {
     res.status(500).json({message: `Something went WRONG!${error}`});
   }
}


const addToHistory = async(req, res) => {
    const {token, meeting_code} = req.body;
    try {
        const user = await User.findOne({token: token})
        const newMeeting = new Meeting({
            user_id: user._id,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({message: "Meeting Code Added to History"})
    } catch (e) {
      res.json({message: `Something Went Wrong ${e}`})  
    }
}

const deleteHistory = async (req, res) => {
    const {token, meeting_code} = req.query;
    try {

        const user = await User.findOne({token})
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message: "User Not Found"})
        }

        const deleteMeeting = await Meeting.findOneAndDelete({
            user_id: user._id,
            meetingCode : meeting_code 
            
        })
        

        res.status(httpStatus.OK).json({message: " Meeting History Deleted"})

    } catch (err) {
        res.status(500).json({message: `Something Went Wrong ${err}`})
    }
}

export { login, register, getUserHistory, addToHistory, deleteHistory };