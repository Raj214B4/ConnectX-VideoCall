let Is_PROD = true;

const server =  Is_PROD ? 
        "https://connectxbackend.onrender.com" 
        :
        "http://localhost:8080"
    

export default server;