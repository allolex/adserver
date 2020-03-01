const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const app = express();

const {startDatabase} = require("./database/mongo");
const {insertAd, getAds, deleteAd, updateAd} = require("./database/ads");


const authZeroDomain = 'dev-n5g-rwr2.auth0.com';

app.use(helmet());
app.use(bodyParser.json());
app.use(cors())
app.use(morgan("combined"));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authZeroDomain}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: 'https://adserver',
  issuer: `https://${authZeroDomain}/`,
  algorithms: ['RS256']
});

app.get("/", async (req, res) => {
  res.send(await getAds());
});

app.use(checkJwt);

app.post("/", async (req, res) => {
  const newAd = req.body;
  await insertAd(newAd);
  res.send({message: "Inserted new ad"});
});

app.delete("/:id", async (req, res) => {
  const id = req.params.id
  await deleteAd(id);
  res.send({message: "Deleted ad " + id})
});

app.put('/:id', async (req, res) => {
  const updatedAd = req.body;
  await updateAd(req.params.id, updatedAd);
  res.send({ message: 'Ad updated.' });
});

const listenPort = 3001;

startDatabase().then(async () => {
  await insertAd({title: "Hello from the in-memory database"});

  app.listen(listenPort, () => { console.log("Listening on port ", listenPort) });
});
