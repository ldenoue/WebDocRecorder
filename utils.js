const shortid = require('shortid');
const fs = require('fs');

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


function validRoom(room) {
  return shortid.isValid(room);
}

function createRoom() {
  return shortid.generate();
}

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
          }
          return callback(null,data);
        });
      });
    });
}

module.exports.createFolderIfNotExist = createFolderIfNotExist;
module.exports.list = list;
module.exports.createRoom = createRoom;
module.exports.validRoom = validRoom;
module.exports.getMouseCoords = getMouseCoords;
