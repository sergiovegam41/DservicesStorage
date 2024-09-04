// import {  connect } from 'mongoose';
import { MONGODB_URI } from "./config.js";
import { MongoClient, ServerApiVersion } from "mongodb";

export class DBNames {
  static uploads = "uploads";
  static Config = "Config";
  static sessionTokens = "session_tokens";
  static UserCopy = "UserCopy";
  static technical_workplace = "technical_workplace";
  static BackList = "BackList";

}

export const connectDB = async (onConnect) => {
  try {
    const Mongoclient = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });

    return Mongoclient.connect(async (err) => {
      if (onConnect) {
        onConnect(Mongoclient);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
