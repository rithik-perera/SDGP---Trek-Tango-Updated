require('dotenv').config();
const mongodbURI = process.env.mongodbURI;

//express
const express = require ('express');
const app = express();

//Other Node Packages
const bodyParser = require('body-parser');
const cors = require('cors');

//Database
const connectDB = require('./Database/connect');

//routers
const userRouter = require('./routes/userRoutes');
const destinationListRouter = require('./routes/destinationListRoute');
const socialMediaRouter = require('./routes/socialMediaRoutes');
const sessionRouter = require('./routes/sessionRoute');

//middleware


app.use(bodyParser.json());
app.use(cors());

app.use('/api/users', userRouter);
app.use('/api/destinationOrder', destinationListRouter);
app.use('/api/socialMedia', socialMediaRouter);
app.use('/api/session', sessionRouter);

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(mongodbURI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();