'use strict';

const request = require('request');
var shortid = require('shortid');
var os = require('os');
var md5 = require('md5');
var express = require('express');
var expressurl = require('url');
var helmet = require('helmet');
var swig  = require('swig');
var cors = require('cors');
var fs = require('fs');
var fileUpload = require('express-fileupload');
var compression = require('compression');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cons = require('consolidate');

createFolderIfNotExist('/public');
createFolderIfNotExist('/public/tmp');
createFolderIfNotExist('/public/uploads');

// relative to __dirname, make sure relativePath starts with /
function createFolderIfNotExist(relativePath)
{
  var outdir = __dirname + relativePath;
  try {
    fs.existsSync(outdir,function () {}) || fs.mkdirSync(outdir,function(){});
    return true;
  }
  catch (ecreatedir)
  {
    return false;
  }
}

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

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/')));

app.get('/', function(req, res) {
  res.redirect('/create');
});

app.get('/create', function(req, res) {
  res.render('create.html',{title:'DocuShow Create'});
});

function getMouseCoords(room,callback) {
  var dirname = __dirname + '/public/uploads/' + room;
  var json = dirname + '/strokes.json';
  fs.readFile(json, 'utf-8', function(err, contents) {
    if (err)
      callback(err);
    else
      callback(null,contents);
  });
}

app.get('/v/:room', function(req, res) {
  var room = req.params.room;
  list(room, function (err, data) {
    if (err)
      return res.render('nothere.html');
    data.room = room;
    getMouseCoords(room,function (errmouse,strokes) {
      if (errmouse)
        return res.render('nothere.html');
      data.strokes = strokes;
      res.render('view.html',{data:data});
    });
  });
  
});

app.get('/crocoform', function(req, res) {
  var url_parts = expressurl.parse(req.url, true);
  var url = url_parts.query.url;
  res.render('crocoform.html',{url:url});
});

function validRoom(room) {
  return shortid.isValid(room);
}

function createRoom() {
  return shortid.generate();
}

app.post('/uploadpages', function(req, res) {

	if (!req.files) {
		res.json({error:'No files were uploaded.'});
		return;
	}

  var keys = Object.keys(req.files);
  var n = keys.length;

  var room = null;
  var title = req.body.title;
  //console.log('title=',title);
  //console.log('body=',req.body);
  var password = req.body.password;
  room = createRoom();
  
  var outdir = __dirname+ '/public/uploads/' + room + '/';
  var created = createFolderIfNotExist('/public/uploads/' + room + '/');
  if (!created)
  {
    return res.status(200).json({error:'error creating room on server'});
  }

  fs.writeFile(outdir + 'meta.json', JSON.stringify({user:req.user,title:title,password:password}), 'utf-8', function (){});

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

function list(room,callback)
{
  if (!validRoom(room))
    return callback('not a valid room',null);

    var dirname = __dirname + '/public/uploads/' + room;
    var json = dirname + '/meta.json';
    fs.readFile(json, 'utf-8', function(err, contents) {
      var data = {};
      if (err || !contents)
        return callback('not a valid room');//data = {};
      else
      {
        data = JSON.parse(contents);
      }
      
      fs.readFile(dirname + '/strokes.json', 'utf-8', function(err2, contents2) {
        data.strokes = [];
        if (!err2 && contents2)
        {
          data.strokes = JSON.parse(contents2);
        }
        fs.readdir(dirname, function (errdir, filearray) {
          if (errdir)
            data.files = [];
          else
          {
            var imagearray = filearray.filter(function(file) { return file.substr(-4) === '.jpg'; })
            var oggarray = filearray.filter(function(file) { return file.substr(-4) === '.ogg'; })
            data.files = imagearray.sort(function (a,b) { return +a.split('.')[0] - +b.split('.')[0]});
            data.ogg = oggarray;
            //console.log(data.files);
          }
          return callback(null,data);
        });
      });
    });
}

app.get('/list', function(req, res) {
  var url_parts = expressurl.parse(req.url, true);
  var room = url_parts.query.room;
  if (!room)
    return res.status(500).send({error:'no room'});
  else
  {
    list(room, function (err, filearray) {
      if (err)
        return res.status(404).send([]);
      else
        return res.status(200).send(filearray);
    });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  console.log('404 with ',req.originalUrl);
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

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
