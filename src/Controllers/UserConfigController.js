import { DBNames } from './../db.js';
import { MONGODB_NAME } from './../config.js'
import { ServerApiVersion, ObjectId } from 'mongodb';

class UserConfigController {


  
  
  static async searchOrCreateByUserID(MongoClient, userID){


    if(userID == null){
      return null
    }
  
    userID = parseInt(userID)
    const user = await MongoClient.collection(DBNames.UserConfig).findOne({ userID:userID });
  
    if (!user) {
      return {
        userID: userID,
        notyfyMeByWhatsApp: false,
        notyfyMeByEmail: false
      }
    }
    
    return await MongoClient.collection(DBNames.UserConfig).findOne({ userID:userID });
    
  
  }

 

}



export default UserConfigController 