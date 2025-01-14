import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

var user = process.env.COUCHDB_USER;
var pass = process.env.COUCHDB_PASSWORD;
// const do_token: string = process.env.DIGITALOCEAN_API_TOKEN !== undefined ? process.env.DIGITALOCEAN_API_TOKEN: '';
const domain: string = process.env.DOMAIN !== undefined ? process.env.DOMAIN: '';
const url = new URL(domain);
if (process.env.NODE_ENV === 'development') {
  var nano = require("nano")(`http://${user}:${pass}@127.0.0.1:5984`);
} else {
  var nano = require("nano")(url.protocol + `//${user}:${pass}@db.` + url.hostname);
}
const patients = nano.db.use("patients");

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const new_pt_body = {
    user: {
        display: req.body.first_name + ' ' + req.body.last_name,
        email: req.body.email,
        did: null
    },
    patient: {
        lastname: req.body.last_name,
        firstname: req.body.first_name,
        dob: req.body.dob,
        gender: req.body.gender,
        birthgender: req.body.birthGender
    },
    pin: req.body.pin
  }
  // const opts = {headers: {Authorization: 'Bearer ' + do_token, Accept: 'application/json'}};
  const new_pt = await axios.post(process.env.APP_URL + '/auth/addPatient', new_pt_body);
  const url_full = new_pt.data.url;
  const doc_patient = await patients.get(req.body.email);
  doc_patient.phr = url_full;
  await patients.insert(doc_patient);
  const sendgrid = await fetch(domain + "/api/sendgrid", 
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: req.body.email,
      subject: "HIE of One - New Account Confirmation",
      html: `<div><h1>Your HIE of One Trustee Account has been created!</h1><h2><a href=${domain}/myTrustee>Your HIE of One Trustee Account Dashboard</a></h2><h2><a href=${url_full}>Your Personal Health Record</a></h2></div>`,
    })
  });
  const { error } = await sendgrid.json();
  if (error) {
    res.status(500).send(error.message);
  } else {
    res.send({url: url_full, error: ''});
  }
}

export default withIronSessionApiRoute(handler, {
  cookieName: 'siwe',
  password: `yGB%@)'8FPudp5";E{s5;fq>c7:evVeU`,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
})