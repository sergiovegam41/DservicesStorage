import { DBNames } from './../db.js';

class SessionsController{

    static async getCurrentSession(MongoClient,req){
       try {
        let session_token = (req.headers.authorization||"").replace('Bearer ', '');
        
        // console.log(session_token)
        
        let session_tokensCollection = MongoClient.collection(DBNames.sessionTokens);

        let session = await session_tokensCollection.findOne({ session_token });
        

        if(session){
            
            if(session.userApp){
                return {
                    ...session,
                    user: await MongoClient.collection(DBNames.UserCopy).findOne({ id: session.user_id }),
                    location: await MongoClient.collection(DBNames.technical_workplace).findOne({ user_id: session.user_id }),
                    back_list: await MongoClient.collection(DBNames.BackList).findOne({ userID: parseInt(session.user_id )}),
                }
            }
            
            return {
                ...session,
                user: null,
                location: null,
                back_list: null

            }
        }

        return  false
       } catch (error) {

        console.log("error:")
        console.log(error)
        return  false

       }
    }

}

export default SessionsController 