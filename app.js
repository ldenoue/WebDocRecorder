'use strict';

const request = require('request');
const utils = require('./utils');
const os = require('os');
const express = require('express');
const expressurl = require('url');
const helmet = require('helmet');
const swig  = require('swig');
const cors = require('cors');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cons = require('consolidate');

// create folders used to store uploaded recordings
utils.createFolderIfNotExist('/public');
utils.createFolderIfNotExist('/public/uploads');

var app = express();
    
app.use(helmet());

app.use(function requireHTTPS(req, res, next) {
  if (!req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

app.use(cors());
app.use(compression());
app.use(fileUpload());

// view engine setup
app.engine('html',cons.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// app configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/')));

// app routes
app.get('/', function(req, res) {
  res.redirect('/create');
});

app.get('/create', function(req, res) {
  res.render('create.html',{title:'DocuCast Create'});
});

app.get('/v/:room', function(req, res) {
  var room = req.params.room;
  utils.list(room, function (err, data) {
    if (err)
      return res.render('nothere.html',{title:'DocuCast View'});
    data.room = room;
    utils.getMouseCoords(room,function (errmouse,strokes) {
      if (errmouse)
        return res.render('nothere.html');
      data.strokes = strokes;
      res.render('view.html',{data:data,title:'DocuCast View'});
    });
  });
  
});

app.post('/uploadpages', function(req, res) {

	if (!req.files) {
		return res.json({error:'No files were uploaded.'});
	}

  var keys = Object.keys(req.files);
  var n = keys.length;

  var room = null;
  var title = req.body.title;
  room = utils.createRoom();

  var outdir = __dirname + '/public/uploads/' + room + '/';
  var created = utils.createFolderIfNotExist('/public/uploads/' + room + '/');
  if (!created)
  {
    return res.status(200).json({error:'error creating room on server'});
  }

  fs.writeFile(outdir + 'meta.json', JSON.stringify({user:req.user,title:title}), 'utf-8', function (){});

  var done = false;
  for (var i=0;i<n;i++)
  {
    var sampleFile = req.files[keys[i]];
    var pagenumber = i+1;
    var filename = outdir + keys[i];
    sampleFile.i = i;
    sampleFile.mv(filename, function(err) {
      if (err) {
        return res.status(200).json({error:err});
      }
      if (!done && sampleFile.i >= n-1)
      {
        done = true;
        res.status(200).json({success:room});
      }
    });
  }
});

/*app.get('/list', function(req, res) {
  var url_parts = expressurl.parse(req.url, true);
  var room = url_parts.query.room;
  if (!room)
    return res.status(500).send({error:'no room'});
  else
  {
    utils.list(room, function (err, filearray) {
      if (err)
        return res.status(404).send([]);
      else
        return res.status(200).send(filearray);
    });
  }
});*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  console.log('404 with ',req.originalUrl);
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
/*if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}*/

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
