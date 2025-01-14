import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

var user = process.env.COUCHDB_USER;
var pass = process.env.COUCHDB_PASSWORD;
const domain: string = process.env.DOMAIN !== undefined ? process.env.DOMAIN: '';
const url = new URL(domain);
if (process.env.NODE_ENV === 'development') {
  var nano = require("nano")(`http://${user}:${pass}@127.0.0.1:5984`);
} else {
  var nano = require("nano")(url.protocol + `//${user}:${pass}@db.` + url.hostname);
}
const db = nano.db.use("patients")
db.info().then(console.log)

//Endpoint for clinicans to create requests for patient records in RS
//send data in body formated as :
// data: {
//     "patient": email,
//     "clinician": ETH address,
//     "scope": [], // Read, Update, Create
//     "purpose": [], // Clinical-routine, Clinical-emergency, Research, Customer support, Other
//     "message": "", // optional
//     "state": "initiated", // initiated, accepted-trustee, accepted-patient, completed
//     "date": date // date created
//     "request_data": {
//        "type": "Steps" // The type of data requested
//        "from": "Apple Health" // either apple health or url
//        "date": date //optional
//     } 
//     "reasorce_data": {} // the actual health data. This will be added later by patient. Ive included for dev purposes.
//   }

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await NextCors(req, res, {
    methods: ["PUT"],
    origin: process.env.DOMAIN,
    optionsSuccessStatus: 200
  });
  const {data} = req.body
  if (!data) {
    res.status(500).send("Bad Request: missing items in request");
  }
  const rs_requests = await nano.db.use("rs_requests");
  try {
    const response = await rs_requests.insert(data)
    if (response.error) {
      res.status(500).send({ error: response.error, reason: response.reason});
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).send(error);
  }
}

export default handler;
