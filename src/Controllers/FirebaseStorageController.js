import { DBNames } from "./../db.js";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import moment from "moment";
import Utils from './../Utils/Utils.js';
import SessionsController from "./SessionsController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FirebaseStorageController {
  static async get(MongoClient, req, res) {

    let session = await SessionsController.getCurrentSession(
      MongoClient,
      req
    );

    console.log("session:")
    console.log(session)


    if(!session){
      return res.status(401).send({
        success: false,
        message: "unauthorized",
      });
    }

    const filePath = req.params[0]; 

    let credentials = (
      await MongoClient.collection(DBNames.Config).findOne({
        name: "FIREBASE_CREDENTIALS",
      })
    ).value;

    let buketName = (
      await MongoClient.collection(DBNames.Config).findOne({
        name: "FIREBASE_BUCKET",
      })
    ).value;

    let FileName = filePath

    if( session.userApp ){

      let FoundFile = await MongoClient.collection(DBNames.uploads).findOne(
        {
          path: filePath
        }
      );
  
      if(!FoundFile){

        return res.status(404).send({
          success: false,
          message: "Archivo no encontrado",
        });

      }
  
  
      console.log("FoundFile:")
      console.log(FoundFile)

      if(FoundFile?.public == false ){
        
        if( ( FoundFile?.userID.toString() != session?.user?.id?.toString() )  ){
  
          return res.status(403).send({
            success: false,
            message: "No tienes permisos para acceder a este recurso",
          });
  
        }

      }
      
      FileName = FoundFile.name

    }
    
    console.log("filePath:")
    console.log(filePath)

    credentials = JSON.parse(credentials);
    if (!admin.apps.length) {
      // Evitar re-inicialización
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        storageBucket: buketName,
      });
    }

    const bucket = admin.storage().bucket();
    const file = bucket.file(`${filePath}`);


    try {
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).send({
          success: false,
          message: "Archivo no encontrado",
        });
      }

      const readStream = file.createReadStream();

      // Configurar los encabezados para la descarga
      res.setHeader("Content-Disposition", `attachment; filename=`);
      res.setHeader("Content-Type", "application/octet-stream");

      readStream.pipe(res);

      // Manejo de errores en el stream
      readStream.on("error", (error) => {
        console.error("Error al leer el archivo:", error);
        res.status(500).send({
          success: false,
          message: "Error al leer el archivo.",
        });
      });
    } catch (error) {
      console.error("Error al obtener el archivo:", error);
      res.status(500).send({
        success: false,
        message: "Error al obtener el archivo.",
      });
    }
  }

  static async upload(MongoClient, req, res) {

    try {
      let session = await SessionsController.getCurrentSession(
        MongoClient,
        req
      );
  
  
      let credentials = (
        await MongoClient.collection(DBNames.Config).findOne({
          name: "FIREBASE_CREDENTIALS",
        })
      ).value;
      
      let buketName = (
        await MongoClient.collection(DBNames.Config).findOne({
          name: "FIREBASE_BUCKET",
        })
      ).value;
  
      credentials = JSON.parse(credentials);
      if (!admin.apps.length) {
        // Evitar re-inicialización
  
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
          storageBucket: buketName,
        });
      }
  
  
  
      const bucket = admin.storage().bucket();
      let extencion = Utils.obtenerExtension(req.files[0].originalname);
      let Originalfilename = req.files[0].originalname;
      let filename = req.files[0].filename;
  
  
  
  
      const uploadPath = path.join(__dirname, "../../uploads", filename);
      const timestamp = moment().format("YYYY-MM-DD HH:mm:ss"); // Generar un timestamp único
      let publicFile = false;

      if(req.body.public === true ){
        publicFile = true;
      }
  
      let uploads = await MongoClient.collection(DBNames.uploads).insertOne({
        extencion: extencion,
        userID: session.user.id,
        size: req.files[0].size,
        date: timestamp,
        public: publicFile
        
      });
  
  
      const uniqueFileName = uploads.insertedId.toString() + "." + extencion; // Crear nombre único
  
      const remotePath = `${req.body.path}/${uniqueFileName}`;
      const dataImage = await bucket.upload(uploadPath, {
        destination: remotePath,
      });
  
      await MongoClient.collection(DBNames.uploads).updateOne(
        { _id: uploads.insertedId },
        {
          $set: {
            name: uniqueFileName,
            path: req.body.path + "/" + uniqueFileName,
          },
        }
      );
  
      fs.unlinkSync(uploadPath);
      res.send({
        success: true,
        message: "OK",
        data:  await MongoClient.collection(DBNames.uploads).findOne({ _id: uploads.insertedId }),
      });
    } catch (error) {

      console.log(error)
      res.send({
        success: false,
        message: error,
        data:  null
      });
    }

  }

  
}

export default FirebaseStorageController;
