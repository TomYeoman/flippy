import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';

import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config.dev.js';

//import users from './routes/users';
let fs = require('fs');
let app = express();
var server = app.listen(3000);
// Socket.IO part
let io = require('socket.io')(server);


var sendFeatures = function (socket) {
  fs.readFile('data/_features.json', 'utf8', function(err, features) {
    features = JSON.parse(features);
    socket.emit('features', features);
  });
};

io.on('connection', function (socket) {
  console.log('New client connected!');
  sendFeatures(socket);

  fs.watch('data/_features.json', function (event, filename) {
    sendFeatures(socket);
  });

  socket.on("updateFeature", function (data){
    console.log(`TRYING TO UPDATE FEATURE ${data.name}`);

    fs.readFile('data/_features.json', 'utf8', function(err, features) {

      features = JSON.parse(features);

      let FeatureName = data.name;

      for (var i = 0; i < features.length; i++) {
        // If we can find an object which matches the name of the one we passed in
        if (features[i][FeatureName] !== undefined){
          console.log("BEFORE");
          console.log(features[i][FeatureName]);
          features[i][FeatureName].flag = data.flag;
          console.log("AFTER");
          console.log(features[i][FeatureName]);

        }

      }
      console.log("FEATURES AFTER");
      console.log(features);

      // Write changes back to file
      fs.writeFile('data/_features.json', JSON.stringify(features), function (err) {

      });
    });

  });

});

// We need to create a post request to users, Define the API we will users
//app.use(bodyParser.json());
//app.use('/api/users', users);

const compiler = webpack(webpackConfig);

app.use(webpackMiddleware(compiler,{
  hot: true,
  publicPath: webpackConfig.output.publicPath,
  noInfo: true
}));

app.use(webpackHotMiddleware(compiler))
app.use('/css',express.static(path.join(__dirname, 'public/css')));
app.use('/images',express.static(path.join(__dirname, 'public/assets')));
app.use('/js',express.static(path.join(__dirname, 'public/js')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

//app.listen(3000, () => console.log("Running on localhost 3000"))
console.log("Running on localhost 3000");
