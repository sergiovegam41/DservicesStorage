import CronJobs from "./Jobs/CronJobs.js";
import moment from "moment";
import cron from "node-cron";
import FirebaseStorageController from "./Controllers/FirebaseStorageController.js";
import SessionsController from "./Controllers/SessionsController.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export default (app, MongoClient) => {
  app.post("/storage/upload/", upload.any(),validationMiddleware, async (req, res) =>
    FirebaseStorageController.upload(MongoClient, req, res)
  );

  app.get("/storage/get/*", validationMiddleware, async (req, res) =>
    FirebaseStorageController.get(MongoClient, req, res)
  );

  app.get("/ping", async function (req, res) {
    return res.send(true);
  });

  async function validationMiddleware(req, res, next) {
    console.log("validationMiddleware");

    try {
      let session = await SessionsController.getCurrentSession(
        MongoClient,
        req
      );
      if (session) {
        return next();
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send("ERROR");
    }
    return res.status(404).send("BAD_REQUEST");
  }

  let formattedTime = parseInt(moment.utc().startOf("day").local().format("H"));

  let UTCRangeTimeInvert = [];

  for (let i = 0; i <= 23; i++) {
    if (formattedTime > 23) {
      formattedTime = 0;
    }

    UTCRangeTimeInvert[i] = { formattedTime, utc_hour: i };
    formattedTime++;
  }

  // console.log(UTCRangeTimeInvert);
  UTCRangeTimeInvert.forEach(function (valor, clave) {
    cron.schedule(`0 ${valor.formattedTime} * * *`, () => {
      CronJobs.run(MongoClient, valor.utc_hour);
    });
  });

};
