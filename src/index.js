import app  from './app.js';
// import { Server as WebSocketServer } from 'socket.io';
import http from 'http';
import { connectDB } from './db.js';
// import sockets from './sockets.js';
import routes from './route.js';
import { PORT,MONGODB_NAME } from './config.js';

( async ()=>{
    
    await connectDB(function(Mongoclient){

        var MongoClient = Mongoclient.db(MONGODB_NAME);
        console.log( "mongodb connect to " + MONGODB_NAME )

        routes(app,MongoClient)
        
        const server = http.createServer(app)
        
        const httpServer = server.listen(PORT,'0.0.0.0',()=>{
            
            console.log("Server runing in port "+PORT)
            
            // const io = new WebSocketServer(httpServer, {
            //     cors: {
            //     origin:"*"
            // }})

            // sockets(io,MongoClient)

        })

    })

} )();

