const{app, BrowserWindow} = require('electron')
//credit to "https://electronjs.org/docs/tutorial/first-app"
function createWindow(){
  let window = new BrowserWindow({
    width: 700,
    height: 700,
    webPreferences: {
    nodeIntegration: true}
  })
  window.loadFile('electron/index.html')
}

  app.on('ready', createWindow)
//var BrowserWindow = require ('browser-window');

//const remote = require('remote'),
//  apppa = remote.require('app');

//app.on('ready', createWindow){
   //mainWindow = new BrowserWindow({
    //height: 700,
    //width: 700,
//  })

  //mainWindow.loadUrl('file://' + __dirname + '/index.html');
  //mainWindow.on('closed', function(){
    mainWindow = null
  }
