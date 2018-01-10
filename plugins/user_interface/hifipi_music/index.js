'use strict';

var libQ = require('kew');
var fs = require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var path = require('path')
// hifipi extends the api
var axios = require('axios');
var api = require('/volumio/http/restapi.js');

module.exports = hifipiMusic;

function hifipiMusic(context) {
  var self = this;

  self.context = context;
  self.commandRouter = this.context.coreCommand;
  self.logger = this.context.logger;
  self.configManager = this.context.configManager;
  var notFound = {'Error': "Error 404: resource not found"};
  var success = {'Message': "Succesfully to start downloading music"};

  api.route('/hifipi/download/:uuid').get(function (req, res) {
    var uuid = req.params.uuid;
    var fileUrl = 'http://192.168.10.78:8080/hifi-storage-service/api/download/' + uuid;
    axios.get(fileUrl, {responseType: 'stream'}).then((response) => {
        if (response.status == 200 && response.data) {
          // res.json(response._data);
          var contentDisposition = response.headers['content-disposition'].match(/filename="?([^"]+)"?/);
          // hifipi save the file to disk
          var filename = contentDisposition == null? Date.now() : contentDisposition[1];
          response.data.pipe(fs.createWriteStream(path.join('/data/INTERNAL/hifipi/', filename)));
          //fs.writeFile(path.join('/data/INTERNAL', filename), response.data, function (err) {
          //	self.logger.error("Could not save the music file!");
          //}
          //res.json(success);
          self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'hifipiMusic::download completed:' + uuid);
        } else {
          self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'hifipiMusic::download faild:' + uuid);
          self.logger.info("Could not complete the download request!");
          //res.json(notFound);
        }
      }
    ).catch(err => {
      self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'hifipiMusic::download faild:' + uuid);
      self.logger.error("Could not save the music file!" + err.message);
      res.json(notFound);
    })
    res.json(success);
  });
}

hifipiMusic.prototype.onVolumioStart = function () {
  var self = this;
  var configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
  this.config = new (require('v-conf'))();
  this.config.loadFile(configFile);

  return libQ.resolve();
}

hifipiMusic.prototype.onStart = function () {
  var self = this;
  var defer = libQ.defer();

  // Once the Plugin has successfull started resolve the promise
  defer.resolve();

  return defer.promise;
};

hifipiMusic.prototype.onStop = function () {
  var self = this;
  var defer = libQ.defer();

  // Once the Plugin has successfull stopped resolve the promise
  defer.resolve();

  return libQ.resolve();
};

hifipiMusic.prototype.onRestart = function () {
  var self = this;
  // Optional, use if you need it
};

// Configuration Methods -----------------------------------------------------------------------------

hifipiMusic.prototype.getUIConfig = function () {
  var defer = libQ.defer();
  var self = this;

  var lang_code = this.commandRouter.sharedVars.get('language_code');

  self.commandRouter.i18nJson(__dirname + '/i18n/strings_' + lang_code + '.json',
    __dirname + '/i18n/strings_en.json',
    __dirname + '/UIConfig.json')
    .then(function (uiconf) {

      defer.resolve(uiconf);
    })
    .fail(function () {
      defer.reject(new Error());
    });

  return defer.promise;
};

hifipiMusic.prototype.setUIConfig = function (data) {
  var self = this;
  //Perform your installation tasks here
};

hifipiMusic.prototype.getConf = function (varName) {
  var self = this;
  //Perform your installation tasks here
};

hifipiMusic.prototype.setConf = function (varName, varValue) {
  var self = this;
  //Perform your installation tasks here
};

// Playback Controls ---------------------------------------------------------------------------------------
// If your plugin is not a music_sevice don't use this part and delete it

hifipiMusic.prototype.addToBrowseSources = function () {

  // Use this function to add your music service plugin to music sources
  //var data = {name: 'Spotify', uri: 'spotify',plugin_type:'music_service',plugin_name:'spop'};
  this.commandRouter.volumioAddToBrowseSources(data);
};

hifipiMusic.prototype.handleBrowseUri = function (curUri) {
  var self = this;

  //self.commandRouter.logger.info(curUri);
  var response;

  return response;
};

// Define a method to clear, add, and play an array of tracks
hifipiMusic.prototype.clearAddPlayTrack = function (track) {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'hifipiMusic::clearAddPlayTrack');

  self.commandRouter.logger.info(JSON.stringify(track));

  return self.sendSpopCommand('uplay', [track.uri]);
};

hifipiMusic.prototype.seek = function (timepos) {
  this.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'hifipiMusic::seek to ' + timepos);

  return this.sendSpopCommand('seek ' + timepos, []);
};

// Stop
hifipiMusic.prototype.stop = function () {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'hifipiMusic::stop');

};

// Spop pause
hifipiMusic.prototype.pause = function () {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'hifipiMusic::pause');

};

// Get state
hifipiMusic.prototype.getState = function () {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'hifipiMusic::getState');

};

//Parse state
hifipiMusic.prototype.parseState = function (sState) {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'hifipiMusic::parseState');

  //Use this method to parse the state and eventually send it with the following function
};

// Announce updated State
hifipiMusic.prototype.pushState = function (state) {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'hifipiMusic::pushState');

  return self.commandRouter.servicePushState(state, self.servicename);
};

hifipiMusic.prototype.explodeUri = function (uri) {
  var self = this;
  var defer = libQ.defer();

  // Mandatory: retrieve all info for a given URI

  return defer.promise;
};

hifipiMusic.prototype.getAlbumArt = function (data, path) {

  var artist, album;

  if (data != undefined && data.path != undefined) {
    path = data.path;
  }

  var web;

  if (data != undefined && data.artist != undefined) {
    artist = data.artist;
    if (data.album != undefined)
      album = data.album;
    else album = data.artist;

    web = '?web=' + nodetools.urlEncode(artist) + '/' + nodetools.urlEncode(album) + '/large'
  }

  var url = '/albumart';

  if (web != undefined)
    url = url + web;

  if (web != undefined && path != undefined)
    url = url + '&';
  else if (path != undefined)
    url = url + '?';

  if (path != undefined)
    url = url + 'path=' + nodetools.urlEncode(path);

  return url;
};

hifipiMusic.prototype.search = function (query) {
  var self = this;
  var defer = libQ.defer();

  // Mandatory, search. You can divide the search in sections using following functions

  return defer.promise;
};

hifipiMusic.prototype._searchArtists = function (results) {

};

hifipiMusic.prototype._searchAlbums = function (results) {

};

hifipiMusic.prototype._searchPlaylists = function (results) {

};

hifipiMusic.prototype._searchTracks = function (results) {

};
