import { DBNames } from "./../db.js";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import moment from "moment";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FirebaseStorageController {
  static async get(MongoClient, req, res) {
    const filePath = req.query.filePath; // Asegúrate de pasar el path del archivo también

    let credentials = (
      await MongoClient.collection(DBNames.Config).findOne({
        name: "FIREBASE_CREDENTIALS",
      })
    ).value;

    credentials = JSON.parse(credentials);
    if (!admin.apps.length) {
      // Evitar re-inicialización
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        storageBucket: "dservices-ea943.appspot.com",
      });
    }

    const bucket = admin.storage().bucket();
    const file = bucket.file(`${filePath}`);

    console.log(filePath);

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
      res.setHeader("Content-Disposition", `attachment; filename=file`);
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
    let credentials = (
      await MongoClient.collection(DBNames.Config).findOne({
        name: "FIREBASE_CREDENTIALS",
      })
    ).value;

    credentials = JSON.parse(credentials);
    if (!admin.apps.length) {
      // Evitar re-inicialización

      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        storageBucket: "dservices-ea943.appspot.com",
      });
    }

    console.log(req.files);

    const bucket = admin.storage().bucket();
    let extencion = req.files[0].mimetype.split("/")[1];
    let Originalfilename = req.files[0].originalname;
    let filename = req.files[0].filename;

    console.log(extencion);
    const uploadPath = path.join(__dirname, "../../uploads", filename);

    const timestamp = moment().format("YYYYMMDDHHmmss"); // Generar un timestamp único

    let uploads = await MongoClient.collection(DBNames.uploads).insertOne({
      extencion: extencion,
      userID: "1",
      size: req.files[0].size,
      date: timestamp,
    });

    console.log(uploads.insertedId.toString());

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
      data: dataImage,
    });
  }
}

export default FirebaseStorageController;
