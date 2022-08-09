const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const route = require("./routes/route.js");
const cors = require('cors')
require('dotenv').config()
const { worker } = require("./controller/workerContronner.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: '*' }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose
  .connect(
    process.env.MONGODB, {
    useNewUrlParser: true,
  }
  )
  .then((result) => console.log("✅ MongoDb is connected"))
  .catch((err) => console.log('⚠️ ', err.message));

app.use("/", route);

worker()

app.use(express.static('public/assets'));
app.use('/css', express.static(__dirname + 'public/assets/css'));
app.use('/js', express.static(__dirname + 'public/assets/js'));
app.use('/files', express.static(__dirname + 'public/assets/files'));

app.get('/', (req, res) =>
  res.sendFile('index.html', { root: 'public' })
);

app.listen(port, () => {
  console.log(`✅ Server is start on port ${port}`);
});