/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(1);
	
	var _fs = __webpack_require__(13);
	
	var _fs2 = _interopRequireDefault(_fs);
	
	var _path = __webpack_require__(12);
	
	var _path2 = _interopRequireDefault(_path);
	
	var _electron = __webpack_require__(14);
	
	var _loginWindow = __webpack_require__(15);
	
	var _loginWindow2 = _interopRequireDefault(_loginWindow);
	
	var _mainWindow = __webpack_require__(16);
	
	var _mainWindow2 = _interopRequireDefault(_mainWindow);
	
	var _helpers = __webpack_require__(24);
	
	var _helpers2 = _interopRequireDefault(_helpers);
	
	var _inferFlash = __webpack_require__(29);
	
	var _inferFlash2 = _interopRequireDefault(_inferFlash);
	
	var _electronDl = __webpack_require__(30);
	
	var _electronDl2 = _interopRequireDefault(_electronDl);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var isOSX = _helpers2.default.isOSX;
	
	
	(0, _electronDl2.default)();
	
	var APP_ARGS_FILE_PATH = _path2.default.join(__dirname, '..', 'nativefier.json');
	var appArgs = JSON.parse(_fs2.default.readFileSync(APP_ARGS_FILE_PATH, 'utf8'));
	
	var mainWindow = void 0;
	
	if (typeof appArgs.flashPluginDir === 'string') {
	    _electron.app.commandLine.appendSwitch('ppapi-flash-path', appArgs.flashPluginDir);
	} else if (appArgs.flashPluginDir) {
	    var flashPath = (0, _inferFlash2.default)();
	    _electron.app.commandLine.appendSwitch('ppapi-flash-path', flashPath);
	}
	
	if (appArgs.ignoreCertificate) {
	    _electron.app.commandLine.appendSwitch('ignore-certificate-errors');
	}
	
	// do nothing for setDockBadge if not OSX
	var setDockBadge = function setDockBadge() {};
	
	if (isOSX()) {
	    setDockBadge = _electron.app.dock.setBadge;
	}
	
	_electron.app.on('window-all-closed', function () {
	    if (!isOSX() || appArgs.fastQuit) {
	        _electron.app.quit();
	    }
	});
	
	_electron.app.on('activate', function (event, hasVisibleWindows) {
	    if (isOSX()) {
	        // this is called when the dock is clicked
	        if (!hasVisibleWindows) {
	            mainWindow.show();
	        }
	    }
	});
	
	_electron.app.on('before-quit', function () {
	    // not fired when the close button on the window is clicked
	    if (isOSX()) {
	        // need to force a quit as a workaround here to simulate the osx app hiding behaviour
	        // Somehow sokution at https://github.com/atom/electron/issues/444#issuecomment-76492576 does not work,
	        // e.prevent default appears to persist
	
	        // might cause issues in the future as before-quit and will-quit events are not called
	        _electron.app.exit(0);
	    }
	});
	
	_electron.app.on('ready', function () {
	    mainWindow = (0, _mainWindow2.default)(appArgs, _electron.app.quit, setDockBadge);
	});
	
	_electron.app.on('login', function (event, webContents, request, authInfo, callback) {
	    // for http authentication
	    event.preventDefault();
	    (0, _loginWindow2.default)(callback);
	});
	
	_electron.ipcMain.on('notification', function () {
	    if (!isOSX() || mainWindow.isFocused()) {
	        return;
	    }
	    setDockBadge('●');
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(2).install();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var SourceMapConsumer = __webpack_require__(3).SourceMapConsumer;
	var path = __webpack_require__(12);
	var fs = __webpack_require__(13);
	
	// Only install once if called multiple times
	var errorFormatterInstalled = false;
	var uncaughtShimInstalled = false;
	
	// If true, the caches are reset before a stack trace formatting operation
	var emptyCacheBetweenOperations = false;
	
	// Supports {browser, node, auto}
	var environment = "auto";
	
	// Maps a file path to a string containing the file contents
	var fileContentsCache = {};
	
	// Maps a file path to a source map for that file
	var sourceMapCache = {};
	
	// Regex for detecting source maps
	var reSourceMap = /^data:application\/json[^,]+base64,/;
	
	// Priority list of retrieve handlers
	var retrieveFileHandlers = [];
	var retrieveMapHandlers = [];
	
	function isInBrowser() {
	  if (environment === "browser")
	    return true;
	  if (environment === "node")
	    return false;
	  return ((typeof window !== 'undefined') && (typeof XMLHttpRequest === 'function'));
	}
	
	function hasGlobalProcessEventEmitter() {
	  return ((typeof process === 'object') && (process !== null) && (typeof process.on === 'function'));
	}
	
	function handlerExec(list) {
	  return function(arg) {
	    for (var i = 0; i < list.length; i++) {
	      var ret = list[i](arg);
	      if (ret) {
	        return ret;
	      }
	    }
	    return null;
	  };
	}
	
	var retrieveFile = handlerExec(retrieveFileHandlers);
	
	retrieveFileHandlers.push(function(path) {
	  // Trim the path to make sure there is no extra whitespace.
	  path = path.trim();
	  if (path in fileContentsCache) {
	    return fileContentsCache[path];
	  }
	
	  try {
	    // Use SJAX if we are in the browser
	    if (isInBrowser()) {
	      var xhr = new XMLHttpRequest();
	      xhr.open('GET', path, false);
	      xhr.send(null);
	      var contents = null
	      if (xhr.readyState === 4 && xhr.status === 200) {
	        contents = xhr.responseText
	      }
	    }
	
	    // Otherwise, use the filesystem
	    else {
	      var contents = fs.readFileSync(path, 'utf8');
	    }
	  } catch (e) {
	    var contents = null;
	  }
	
	  return fileContentsCache[path] = contents;
	});
	
	// Support URLs relative to a directory, but be careful about a protocol prefix
	// in case we are in the browser (i.e. directories may start with "http://")
	function supportRelativeURL(file, url) {
	  if (!file) return url;
	  var dir = path.dirname(file);
	  var match = /^\w+:\/\/[^\/]*/.exec(dir);
	  var protocol = match ? match[0] : '';
	  return protocol + path.resolve(dir.slice(protocol.length), url);
	}
	
	function retrieveSourceMapURL(source) {
	  var fileData;
	
	  if (isInBrowser()) {
	    var xhr = new XMLHttpRequest();
	    xhr.open('GET', source, false);
	    xhr.send(null);
	    fileData = xhr.readyState === 4 ? xhr.responseText : null;
	
	    // Support providing a sourceMappingURL via the SourceMap header
	    var sourceMapHeader = xhr.getResponseHeader("SourceMap") ||
	                          xhr.getResponseHeader("X-SourceMap");
	    if (sourceMapHeader) {
	      return sourceMapHeader;
	    }
	  }
	
	  // Get the URL of the source map
	  fileData = retrieveFile(source);
	  //        //# sourceMappingURL=foo.js.map                       /*# sourceMappingURL=foo.js.map */
	  var re = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/)[ \t]*$)/mg;
	  // Keep executing the search to find the *last* sourceMappingURL to avoid
	  // picking up sourceMappingURLs from comments, strings, etc.
	  var lastMatch, match;
	  while (match = re.exec(fileData)) lastMatch = match;
	  if (!lastMatch) return null;
	  return lastMatch[1];
	};
	
	// Can be overridden by the retrieveSourceMap option to install. Takes a
	// generated source filename; returns a {map, optional url} object, or null if
	// there is no source map.  The map field may be either a string or the parsed
	// JSON object (ie, it must be a valid argument to the SourceMapConsumer
	// constructor).
	var retrieveSourceMap = handlerExec(retrieveMapHandlers);
	retrieveMapHandlers.push(function(source) {
	  var sourceMappingURL = retrieveSourceMapURL(source);
	  if (!sourceMappingURL) return null;
	
	  // Read the contents of the source map
	  var sourceMapData;
	  if (reSourceMap.test(sourceMappingURL)) {
	    // Support source map URL as a data url
	    var rawData = sourceMappingURL.slice(sourceMappingURL.indexOf(',') + 1);
	    sourceMapData = new Buffer(rawData, "base64").toString();
	    sourceMappingURL = null;
	  } else {
	    // Support source map URLs relative to the source URL
	    sourceMappingURL = supportRelativeURL(source, sourceMappingURL);
	    sourceMapData = retrieveFile(sourceMappingURL);
	  }
	
	  if (!sourceMapData) {
	    return null;
	  }
	
	  return {
	    url: sourceMappingURL,
	    map: sourceMapData
	  };
	});
	
	function mapSourcePosition(position) {
	  var sourceMap = sourceMapCache[position.source];
	  if (!sourceMap) {
	    // Call the (overrideable) retrieveSourceMap function to get the source map.
	    var urlAndMap = retrieveSourceMap(position.source);
	    if (urlAndMap) {
	      sourceMap = sourceMapCache[position.source] = {
	        url: urlAndMap.url,
	        map: new SourceMapConsumer(urlAndMap.map)
	      };
	
	      // Load all sources stored inline with the source map into the file cache
	      // to pretend like they are already loaded. They may not exist on disk.
	      if (sourceMap.map.sourcesContent) {
	        sourceMap.map.sources.forEach(function(source, i) {
	          var contents = sourceMap.map.sourcesContent[i];
	          if (contents) {
	            var url = supportRelativeURL(sourceMap.url, source);
	            fileContentsCache[url] = contents;
	          }
	        });
	      }
	    } else {
	      sourceMap = sourceMapCache[position.source] = {
	        url: null,
	        map: null
	      };
	    }
	  }
	
	  // Resolve the source URL relative to the URL of the source map
	  if (sourceMap && sourceMap.map) {
	    var originalPosition = sourceMap.map.originalPositionFor(position);
	
	    // Only return the original position if a matching line was found. If no
	    // matching line is found then we return position instead, which will cause
	    // the stack trace to print the path and line for the compiled file. It is
	    // better to give a precise location in the compiled file than a vague
	    // location in the original file.
	    if (originalPosition.source !== null) {
	      originalPosition.source = supportRelativeURL(
	        sourceMap.url, originalPosition.source);
	      return originalPosition;
	    }
	  }
	
	  return position;
	}
	
	// Parses code generated by FormatEvalOrigin(), a function inside V8:
	// https://code.google.com/p/v8/source/browse/trunk/src/messages.js
	function mapEvalOrigin(origin) {
	  // Most eval() calls are in this format
	  var match = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(origin);
	  if (match) {
	    var position = mapSourcePosition({
	      source: match[2],
	      line: match[3],
	      column: match[4] - 1
	    });
	    return 'eval at ' + match[1] + ' (' + position.source + ':' +
	      position.line + ':' + (position.column + 1) + ')';
	  }
	
	  // Parse nested eval() calls using recursion
	  match = /^eval at ([^(]+) \((.+)\)$/.exec(origin);
	  if (match) {
	    return 'eval at ' + match[1] + ' (' + mapEvalOrigin(match[2]) + ')';
	  }
	
	  // Make sure we still return useful information if we didn't find anything
	  return origin;
	}
	
	// This is copied almost verbatim from the V8 source code at
	// https://code.google.com/p/v8/source/browse/trunk/src/messages.js. The
	// implementation of wrapCallSite() used to just forward to the actual source
	// code of CallSite.prototype.toString but unfortunately a new release of V8
	// did something to the prototype chain and broke the shim. The only fix I
	// could find was copy/paste.
	function CallSiteToString() {
	  var fileName;
	  var fileLocation = "";
	  if (this.isNative()) {
	    fileLocation = "native";
	  } else {
	    fileName = this.getScriptNameOrSourceURL();
	    if (!fileName && this.isEval()) {
	      fileLocation = this.getEvalOrigin();
	      fileLocation += ", ";  // Expecting source position to follow.
	    }
	
	    if (fileName) {
	      fileLocation += fileName;
	    } else {
	      // Source code does not originate from a file and is not native, but we
	      // can still get the source position inside the source string, e.g. in
	      // an eval string.
	      fileLocation += "<anonymous>";
	    }
	    var lineNumber = this.getLineNumber();
	    if (lineNumber != null) {
	      fileLocation += ":" + lineNumber;
	      var columnNumber = this.getColumnNumber();
	      if (columnNumber) {
	        fileLocation += ":" + columnNumber;
	      }
	    }
	  }
	
	  var line = "";
	  var functionName = this.getFunctionName();
	  var addSuffix = true;
	  var isConstructor = this.isConstructor();
	  var isMethodCall = !(this.isToplevel() || isConstructor);
	  if (isMethodCall) {
	    var typeName = this.getTypeName();
	    var methodName = this.getMethodName();
	    if (functionName) {
	      if (typeName && functionName.indexOf(typeName) != 0) {
	        line += typeName + ".";
	      }
	      line += functionName;
	      if (methodName && functionName.indexOf("." + methodName) != functionName.length - methodName.length - 1) {
	        line += " [as " + methodName + "]";
	      }
	    } else {
	      line += typeName + "." + (methodName || "<anonymous>");
	    }
	  } else if (isConstructor) {
	    line += "new " + (functionName || "<anonymous>");
	  } else if (functionName) {
	    line += functionName;
	  } else {
	    line += fileLocation;
	    addSuffix = false;
	  }
	  if (addSuffix) {
	    line += " (" + fileLocation + ")";
	  }
	  return line;
	}
	
	function cloneCallSite(frame) {
	  var object = {};
	  Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach(function(name) {
	    object[name] = /^(?:is|get)/.test(name) ? function() { return frame[name].call(frame); } : frame[name];
	  });
	  object.toString = CallSiteToString;
	  return object;
	}
	
	function wrapCallSite(frame) {
	  // Most call sites will return the source file from getFileName(), but code
	  // passed to eval() ending in "//# sourceURL=..." will return the source file
	  // from getScriptNameOrSourceURL() instead
	  var source = frame.getFileName() || frame.getScriptNameOrSourceURL();
	  if (source) {
	    var line = frame.getLineNumber();
	    var column = frame.getColumnNumber() - 1;
	
	    // Fix position in Node where some (internal) code is prepended.
	    // See https://github.com/evanw/node-source-map-support/issues/36
	    if (line === 1 && !isInBrowser() && !frame.isEval()) {
	      column -= 62;
	    }
	
	    var position = mapSourcePosition({
	      source: source,
	      line: line,
	      column: column
	    });
	    frame = cloneCallSite(frame);
	    frame.getFileName = function() { return position.source; };
	    frame.getLineNumber = function() { return position.line; };
	    frame.getColumnNumber = function() { return position.column + 1; };
	    frame.getScriptNameOrSourceURL = function() { return position.source; };
	    return frame;
	  }
	
	  // Code called using eval() needs special handling
	  var origin = frame.isEval() && frame.getEvalOrigin();
	  if (origin) {
	    origin = mapEvalOrigin(origin);
	    frame = cloneCallSite(frame);
	    frame.getEvalOrigin = function() { return origin; };
	    return frame;
	  }
	
	  // If we get here then we were unable to change the source position
	  return frame;
	}
	
	// This function is part of the V8 stack trace API, for more info see:
	// http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
	function prepareStackTrace(error, stack) {
	  if (emptyCacheBetweenOperations) {
	    fileContentsCache = {};
	    sourceMapCache = {};
	  }
	
	  return error + stack.map(function(frame) {
	    return '\n    at ' + wrapCallSite(frame);
	  }).join('');
	}
	
	// Generate position and snippet of original source with pointer
	function getErrorSource(error) {
	  var match = /\n    at [^(]+ \((.*):(\d+):(\d+)\)/.exec(error.stack);
	  if (match) {
	    var source = match[1];
	    var line = +match[2];
	    var column = +match[3];
	
	    // Support the inline sourceContents inside the source map
	    var contents = fileContentsCache[source];
	
	    // Support files on disk
	    if (!contents && fs.existsSync(source)) {
	      contents = fs.readFileSync(source, 'utf8');
	    }
	
	    // Format the line from the original source code like node does
	    if (contents) {
	      var code = contents.split(/(?:\r\n|\r|\n)/)[line - 1];
	      if (code) {
	        return source + ':' + line + '\n' + code + '\n' +
	          new Array(column).join(' ') + '^';
	      }
	    }
	  }
	  return null;
	}
	
	function printErrorAndExit (error) {
	  var source = getErrorSource(error);
	
	  if (source) {
	    console.error();
	    console.error(source);
	  }
	
	  console.error(error.stack);
	  process.exit(1);
	}
	
	function shimEmitUncaughtException () {
	  var origEmit = process.emit;
	
	  process.emit = function (type) {
	    if (type === 'uncaughtException') {
	      var hasStack = (arguments[1] && arguments[1].stack);
	      var hasListeners = (this.listeners(type).length > 0);
	
	      if (hasStack && !hasListeners) {
	        return printErrorAndExit(arguments[1]);
	      }
	    }
	
	    return origEmit.apply(this, arguments);
	  };
	}
	
	exports.wrapCallSite = wrapCallSite;
	exports.getErrorSource = getErrorSource;
	exports.mapSourcePosition = mapSourcePosition;
	exports.retrieveSourceMap = retrieveSourceMap;
	
	exports.install = function(options) {
	  options = options || {};
	
	  if (options.environment) {
	    environment = options.environment;
	    if (["node", "browser", "auto"].indexOf(environment) === -1) {
	      throw new Error("environment " + environment + " was unknown. Available options are {auto, browser, node}")
	    }
	  }
	
	  // Allow sources to be found by methods other than reading the files
	  // directly from disk.
	  if (options.retrieveFile) {
	    if (options.overrideRetrieveFile) {
	      retrieveFileHandlers.length = 0;
	    }
	
	    retrieveFileHandlers.unshift(options.retrieveFile);
	  }
	
	  // Allow source maps to be found by methods other than reading the files
	  // directly from disk.
	  if (options.retrieveSourceMap) {
	    if (options.overrideRetrieveSourceMap) {
	      retrieveMapHandlers.length = 0;
	    }
	
	    retrieveMapHandlers.unshift(options.retrieveSourceMap);
	  }
	
	  // Configure options
	  if (!emptyCacheBetweenOperations) {
	    emptyCacheBetweenOperations = 'emptyCacheBetweenOperations' in options ?
	      options.emptyCacheBetweenOperations : false;
	  }
	
	  // Install the error reformatter
	  if (!errorFormatterInstalled) {
	    errorFormatterInstalled = true;
	    Error.prepareStackTrace = prepareStackTrace;
	  }
	
	  if (!uncaughtShimInstalled) {
	    var installHandler = 'handleUncaughtExceptions' in options ?
	      options.handleUncaughtExceptions : true;
	
	    // Provide the option to not install the uncaught exception handler. This is
	    // to support other uncaught exception handlers (in test frameworks, for
	    // example). If this handler is not installed and there are no other uncaught
	    // exception handlers, uncaught exceptions will be caught by node's built-in
	    // exception handler and the process will still be terminated. However, the
	    // generated JavaScript code will be shown above the stack trace instead of
	    // the original source code.
	    if (installHandler && hasGlobalProcessEventEmitter()) {
	      uncaughtShimInstalled = true;
	      shimEmitUncaughtException();
	    }
	  }
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Copyright 2009-2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE.txt or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	exports.SourceMapGenerator = __webpack_require__(4).SourceMapGenerator;
	exports.SourceMapConsumer = __webpack_require__(9).SourceMapConsumer;
	exports.SourceNode = __webpack_require__(11).SourceNode;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {
	
	  var base64VLQ = __webpack_require__(5);
	  var util = __webpack_require__(7);
	  var ArraySet = __webpack_require__(8).ArraySet;
	
	  /**
	   * An instance of the SourceMapGenerator represents a source map which is
	   * being built incrementally. To create a new one, you must pass an object
	   * with the following properties:
	   *
	   *   - file: The filename of the generated source.
	   *   - sourceRoot: An optional root for all URLs in this source map.
	   */
	  function SourceMapGenerator(aArgs) {
	    this._file = util.getArg(aArgs, 'file');
	    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
	    this._sources = new ArraySet();
	    this._names = new ArraySet();
	    this._mappings = [];
	    this._sourcesContents = null;
	  }
	
	  SourceMapGenerator.prototype._version = 3;
	
	  /**
	   * Creates a new SourceMapGenerator based on a SourceMapConsumer
	   *
	   * @param aSourceMapConsumer The SourceMap.
	   */
	  SourceMapGenerator.fromSourceMap =
	    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
	      var sourceRoot = aSourceMapConsumer.sourceRoot;
	      var generator = new SourceMapGenerator({
	        file: aSourceMapConsumer.file,
	        sourceRoot: sourceRoot
	      });
	      aSourceMapConsumer.eachMapping(function (mapping) {
	        var newMapping = {
	          generated: {
	            line: mapping.generatedLine,
	            column: mapping.generatedColumn
	          }
	        };
	
	        if (mapping.source) {
	          newMapping.source = mapping.source;
	          if (sourceRoot) {
	            newMapping.source = util.relative(sourceRoot, newMapping.source);
	          }
	
	          newMapping.original = {
	            line: mapping.originalLine,
	            column: mapping.originalColumn
	          };
	
	          if (mapping.name) {
	            newMapping.name = mapping.name;
	          }
	        }
	
	        generator.addMapping(newMapping);
	      });
	      aSourceMapConsumer.sources.forEach(function (sourceFile) {
	        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	        if (content) {
	          generator.setSourceContent(sourceFile, content);
	        }
	      });
	      return generator;
	    };
	
	  /**
	   * Add a single mapping from original source line and column to the generated
	   * source's line and column for this source map being created. The mapping
	   * object should have the following properties:
	   *
	   *   - generated: An object with the generated line and column positions.
	   *   - original: An object with the original line and column positions.
	   *   - source: The original source file (relative to the sourceRoot).
	   *   - name: An optional original token name for this mapping.
	   */
	  SourceMapGenerator.prototype.addMapping =
	    function SourceMapGenerator_addMapping(aArgs) {
	      var generated = util.getArg(aArgs, 'generated');
	      var original = util.getArg(aArgs, 'original', null);
	      var source = util.getArg(aArgs, 'source', null);
	      var name = util.getArg(aArgs, 'name', null);
	
	      this._validateMapping(generated, original, source, name);
	
	      if (source && !this._sources.has(source)) {
	        this._sources.add(source);
	      }
	
	      if (name && !this._names.has(name)) {
	        this._names.add(name);
	      }
	
	      this._mappings.push({
	        generatedLine: generated.line,
	        generatedColumn: generated.column,
	        originalLine: original != null && original.line,
	        originalColumn: original != null && original.column,
	        source: source,
	        name: name
	      });
	    };
	
	  /**
	   * Set the source content for a source file.
	   */
	  SourceMapGenerator.prototype.setSourceContent =
	    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
	      var source = aSourceFile;
	      if (this._sourceRoot) {
	        source = util.relative(this._sourceRoot, source);
	      }
	
	      if (aSourceContent !== null) {
	        // Add the source content to the _sourcesContents map.
	        // Create a new _sourcesContents map if the property is null.
	        if (!this._sourcesContents) {
	          this._sourcesContents = {};
	        }
	        this._sourcesContents[util.toSetString(source)] = aSourceContent;
	      } else {
	        // Remove the source file from the _sourcesContents map.
	        // If the _sourcesContents map is empty, set the property to null.
	        delete this._sourcesContents[util.toSetString(source)];
	        if (Object.keys(this._sourcesContents).length === 0) {
	          this._sourcesContents = null;
	        }
	      }
	    };
	
	  /**
	   * Applies the mappings of a sub-source-map for a specific source file to the
	   * source map being generated. Each mapping to the supplied source file is
	   * rewritten using the supplied source map. Note: The resolution for the
	   * resulting mappings is the minimium of this map and the supplied map.
	   *
	   * @param aSourceMapConsumer The source map to be applied.
	   * @param aSourceFile Optional. The filename of the source file.
	   *        If omitted, SourceMapConsumer's file property will be used.
	   */
	  SourceMapGenerator.prototype.applySourceMap =
	    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile) {
	      // If aSourceFile is omitted, we will use the file property of the SourceMap
	      if (!aSourceFile) {
	        aSourceFile = aSourceMapConsumer.file;
	      }
	      var sourceRoot = this._sourceRoot;
	      // Make "aSourceFile" relative if an absolute Url is passed.
	      if (sourceRoot) {
	        aSourceFile = util.relative(sourceRoot, aSourceFile);
	      }
	      // Applying the SourceMap can add and remove items from the sources and
	      // the names array.
	      var newSources = new ArraySet();
	      var newNames = new ArraySet();
	
	      // Find mappings for the "aSourceFile"
	      this._mappings.forEach(function (mapping) {
	        if (mapping.source === aSourceFile && mapping.originalLine) {
	          // Check if it can be mapped by the source map, then update the mapping.
	          var original = aSourceMapConsumer.originalPositionFor({
	            line: mapping.originalLine,
	            column: mapping.originalColumn
	          });
	          if (original.source !== null) {
	            // Copy mapping
	            if (sourceRoot) {
	              mapping.source = util.relative(sourceRoot, original.source);
	            } else {
	              mapping.source = original.source;
	            }
	            mapping.originalLine = original.line;
	            mapping.originalColumn = original.column;
	            if (original.name !== null && mapping.name !== null) {
	              // Only use the identifier name if it's an identifier
	              // in both SourceMaps
	              mapping.name = original.name;
	            }
	          }
	        }
	
	        var source = mapping.source;
	        if (source && !newSources.has(source)) {
	          newSources.add(source);
	        }
	
	        var name = mapping.name;
	        if (name && !newNames.has(name)) {
	          newNames.add(name);
	        }
	
	      }, this);
	      this._sources = newSources;
	      this._names = newNames;
	
	      // Copy sourcesContents of applied map.
	      aSourceMapConsumer.sources.forEach(function (sourceFile) {
	        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	        if (content) {
	          if (sourceRoot) {
	            sourceFile = util.relative(sourceRoot, sourceFile);
	          }
	          this.setSourceContent(sourceFile, content);
	        }
	      }, this);
	    };
	
	  /**
	   * A mapping can have one of the three levels of data:
	   *
	   *   1. Just the generated position.
	   *   2. The Generated position, original position, and original source.
	   *   3. Generated and original position, original source, as well as a name
	   *      token.
	   *
	   * To maintain consistency, we validate that any new mapping being added falls
	   * in to one of these categories.
	   */
	  SourceMapGenerator.prototype._validateMapping =
	    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
	                                                aName) {
	      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
	          && aGenerated.line > 0 && aGenerated.column >= 0
	          && !aOriginal && !aSource && !aName) {
	        // Case 1.
	        return;
	      }
	      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
	               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
	               && aGenerated.line > 0 && aGenerated.column >= 0
	               && aOriginal.line > 0 && aOriginal.column >= 0
	               && aSource) {
	        // Cases 2 and 3.
	        return;
	      }
	      else {
	        throw new Error('Invalid mapping: ' + JSON.stringify({
	          generated: aGenerated,
	          source: aSource,
	          original: aOriginal,
	          name: aName
	        }));
	      }
	    };
	
	  /**
	   * Serialize the accumulated mappings in to the stream of base 64 VLQs
	   * specified by the source map format.
	   */
	  SourceMapGenerator.prototype._serializeMappings =
	    function SourceMapGenerator_serializeMappings() {
	      var previousGeneratedColumn = 0;
	      var previousGeneratedLine = 1;
	      var previousOriginalColumn = 0;
	      var previousOriginalLine = 0;
	      var previousName = 0;
	      var previousSource = 0;
	      var result = '';
	      var mapping;
	
	      // The mappings must be guaranteed to be in sorted order before we start
	      // serializing them or else the generated line numbers (which are defined
	      // via the ';' separators) will be all messed up. Note: it might be more
	      // performant to maintain the sorting as we insert them, rather than as we
	      // serialize them, but the big O is the same either way.
	      this._mappings.sort(util.compareByGeneratedPositions);
	
	      for (var i = 0, len = this._mappings.length; i < len; i++) {
	        mapping = this._mappings[i];
	
	        if (mapping.generatedLine !== previousGeneratedLine) {
	          previousGeneratedColumn = 0;
	          while (mapping.generatedLine !== previousGeneratedLine) {
	            result += ';';
	            previousGeneratedLine++;
	          }
	        }
	        else {
	          if (i > 0) {
	            if (!util.compareByGeneratedPositions(mapping, this._mappings[i - 1])) {
	              continue;
	            }
	            result += ',';
	          }
	        }
	
	        result += base64VLQ.encode(mapping.generatedColumn
	                                   - previousGeneratedColumn);
	        previousGeneratedColumn = mapping.generatedColumn;
	
	        if (mapping.source) {
	          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
	                                     - previousSource);
	          previousSource = this._sources.indexOf(mapping.source);
	
	          // lines are stored 0-based in SourceMap spec version 3
	          result += base64VLQ.encode(mapping.originalLine - 1
	                                     - previousOriginalLine);
	          previousOriginalLine = mapping.originalLine - 1;
	
	          result += base64VLQ.encode(mapping.originalColumn
	                                     - previousOriginalColumn);
	          previousOriginalColumn = mapping.originalColumn;
	
	          if (mapping.name) {
	            result += base64VLQ.encode(this._names.indexOf(mapping.name)
	                                       - previousName);
	            previousName = this._names.indexOf(mapping.name);
	          }
	        }
	      }
	
	      return result;
	    };
	
	  SourceMapGenerator.prototype._generateSourcesContent =
	    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
	      return aSources.map(function (source) {
	        if (!this._sourcesContents) {
	          return null;
	        }
	        if (aSourceRoot) {
	          source = util.relative(aSourceRoot, source);
	        }
	        var key = util.toSetString(source);
	        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
	                                                    key)
	          ? this._sourcesContents[key]
	          : null;
	      }, this);
	    };
	
	  /**
	   * Externalize the source map.
	   */
	  SourceMapGenerator.prototype.toJSON =
	    function SourceMapGenerator_toJSON() {
	      var map = {
	        version: this._version,
	        file: this._file,
	        sources: this._sources.toArray(),
	        names: this._names.toArray(),
	        mappings: this._serializeMappings()
	      };
	      if (this._sourceRoot) {
	        map.sourceRoot = this._sourceRoot;
	      }
	      if (this._sourcesContents) {
	        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
	      }
	
	      return map;
	    };
	
	  /**
	   * Render the source map being generated to a string.
	   */
	  SourceMapGenerator.prototype.toString =
	    function SourceMapGenerator_toString() {
	      return JSON.stringify(this);
	    };
	
	  exports.SourceMapGenerator = SourceMapGenerator;
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 *
	 * Based on the Base 64 VLQ implementation in Closure Compiler:
	 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
	 *
	 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are
	 * met:
	 *
	 *  * Redistributions of source code must retain the above copyright
	 *    notice, this list of conditions and the following disclaimer.
	 *  * Redistributions in binary form must reproduce the above
	 *    copyright notice, this list of conditions and the following
	 *    disclaimer in the documentation and/or other materials provided
	 *    with the distribution.
	 *  * Neither the name of Google Inc. nor the names of its
	 *    contributors may be used to endorse or promote products derived
	 *    from this software without specific prior written permission.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
	 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
	 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
	 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {
	
	  var base64 = __webpack_require__(6);
	
	  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
	  // length quantities we use in the source map spec, the first bit is the sign,
	  // the next four bits are the actual value, and the 6th bit is the
	  // continuation bit. The continuation bit tells us whether there are more
	  // digits in this value following this digit.
	  //
	  //   Continuation
	  //   |    Sign
	  //   |    |
	  //   V    V
	  //   101011
	
	  var VLQ_BASE_SHIFT = 5;
	
	  // binary: 100000
	  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
	
	  // binary: 011111
	  var VLQ_BASE_MASK = VLQ_BASE - 1;
	
	  // binary: 100000
	  var VLQ_CONTINUATION_BIT = VLQ_BASE;
	
	  /**
	   * Converts from a two-complement value to a value where the sign bit is
	   * is placed in the least significant bit.  For example, as decimals:
	   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
	   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
	   */
	  function toVLQSigned(aValue) {
	    return aValue < 0
	      ? ((-aValue) << 1) + 1
	      : (aValue << 1) + 0;
	  }
	
	  /**
	   * Converts to a two-complement value from a value where the sign bit is
	   * is placed in the least significant bit.  For example, as decimals:
	   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
	   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
	   */
	  function fromVLQSigned(aValue) {
	    var isNegative = (aValue & 1) === 1;
	    var shifted = aValue >> 1;
	    return isNegative
	      ? -shifted
	      : shifted;
	  }
	
	  /**
	   * Returns the base 64 VLQ encoded value.
	   */
	  exports.encode = function base64VLQ_encode(aValue) {
	    var encoded = "";
	    var digit;
	
	    var vlq = toVLQSigned(aValue);
	
	    do {
	      digit = vlq & VLQ_BASE_MASK;
	      vlq >>>= VLQ_BASE_SHIFT;
	      if (vlq > 0) {
	        // There are still more digits in this value, so we must make sure the
	        // continuation bit is marked.
	        digit |= VLQ_CONTINUATION_BIT;
	      }
	      encoded += base64.encode(digit);
	    } while (vlq > 0);
	
	    return encoded;
	  };
	
	  /**
	   * Decodes the next base 64 VLQ value from the given string and returns the
	   * value and the rest of the string.
	   */
	  exports.decode = function base64VLQ_decode(aStr) {
	    var i = 0;
	    var strLen = aStr.length;
	    var result = 0;
	    var shift = 0;
	    var continuation, digit;
	
	    do {
	      if (i >= strLen) {
	        throw new Error("Expected more digits in base 64 VLQ value.");
	      }
	      digit = base64.decode(aStr.charAt(i++));
	      continuation = !!(digit & VLQ_CONTINUATION_BIT);
	      digit &= VLQ_BASE_MASK;
	      result = result + (digit << shift);
	      shift += VLQ_BASE_SHIFT;
	    } while (continuation);
	
	    return {
	      value: fromVLQSigned(result),
	      rest: aStr.slice(i)
	    };
	  };
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {
	
	  var charToIntMap = {};
	  var intToCharMap = {};
	
	  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	    .split('')
	    .forEach(function (ch, index) {
	      charToIntMap[ch] = index;
	      intToCharMap[index] = ch;
	    });
	
	  /**
	   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
	   */
	  exports.encode = function base64_encode(aNumber) {
	    if (aNumber in intToCharMap) {
	      return intToCharMap[aNumber];
	    }
	    throw new TypeError("Must be between 0 and 63: " + aNumber);
	  };
	
	  /**
	   * Decode a single base 64 digit to an integer.
	   */
	  exports.decode = function base64_decode(aChar) {
	    if (aChar in charToIntMap) {
	      return charToIntMap[aChar];
	    }
	    throw new TypeError("Not a valid base 64 digit: " + aChar);
	  };
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {
	
	  /**
	   * This is a helper function for getting values from parameter/options
	   * objects.
	   *
	   * @param args The object we are extracting values from
	   * @param name The name of the property we are getting.
	   * @param defaultValue An optional value to return if the property is missing
	   * from the object. If this is not specified and the property is missing, an
	   * error will be thrown.
	   */
	  function getArg(aArgs, aName, aDefaultValue) {
	    if (aName in aArgs) {
	      return aArgs[aName];
	    } else if (arguments.length === 3) {
	      return aDefaultValue;
	    } else {
	      throw new Error('"' + aName + '" is a required argument.');
	    }
	  }
	  exports.getArg = getArg;
	
	  var urlRegexp = /([\w+\-.]+):\/\/((\w+:\w+)@)?([\w.]+)?(:(\d+))?(\S+)?/;
	  var dataUrlRegexp = /^data:.+\,.+/;
	
	  function urlParse(aUrl) {
	    var match = aUrl.match(urlRegexp);
	    if (!match) {
	      return null;
	    }
	    return {
	      scheme: match[1],
	      auth: match[3],
	      host: match[4],
	      port: match[6],
	      path: match[7]
	    };
	  }
	  exports.urlParse = urlParse;
	
	  function urlGenerate(aParsedUrl) {
	    var url = aParsedUrl.scheme + "://";
	    if (aParsedUrl.auth) {
	      url += aParsedUrl.auth + "@"
	    }
	    if (aParsedUrl.host) {
	      url += aParsedUrl.host;
	    }
	    if (aParsedUrl.port) {
	      url += ":" + aParsedUrl.port
	    }
	    if (aParsedUrl.path) {
	      url += aParsedUrl.path;
	    }
	    return url;
	  }
	  exports.urlGenerate = urlGenerate;
	
	  function join(aRoot, aPath) {
	    var url;
	
	    if (aPath.match(urlRegexp) || aPath.match(dataUrlRegexp)) {
	      return aPath;
	    }
	
	    if (aPath.charAt(0) === '/' && (url = urlParse(aRoot))) {
	      url.path = aPath;
	      return urlGenerate(url);
	    }
	
	    return aRoot.replace(/\/$/, '') + '/' + aPath;
	  }
	  exports.join = join;
	
	  /**
	   * Because behavior goes wacky when you set `__proto__` on objects, we
	   * have to prefix all the strings in our set with an arbitrary character.
	   *
	   * See https://github.com/mozilla/source-map/pull/31 and
	   * https://github.com/mozilla/source-map/issues/30
	   *
	   * @param String aStr
	   */
	  function toSetString(aStr) {
	    return '$' + aStr;
	  }
	  exports.toSetString = toSetString;
	
	  function fromSetString(aStr) {
	    return aStr.substr(1);
	  }
	  exports.fromSetString = fromSetString;
	
	  function relative(aRoot, aPath) {
	    aRoot = aRoot.replace(/\/$/, '');
	
	    var url = urlParse(aRoot);
	    if (aPath.charAt(0) == "/" && url && url.path == "/") {
	      return aPath.slice(1);
	    }
	
	    return aPath.indexOf(aRoot + '/') === 0
	      ? aPath.substr(aRoot.length + 1)
	      : aPath;
	  }
	  exports.relative = relative;
	
	  function strcmp(aStr1, aStr2) {
	    var s1 = aStr1 || "";
	    var s2 = aStr2 || "";
	    return (s1 > s2) - (s1 < s2);
	  }
	
	  /**
	   * Comparator between two mappings where the original positions are compared.
	   *
	   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
	   * mappings with the same original source/line/column, but different generated
	   * line and column the same. Useful when searching for a mapping with a
	   * stubbed out mapping.
	   */
	  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
	    var cmp;
	
	    cmp = strcmp(mappingA.source, mappingB.source);
	    if (cmp) {
	      return cmp;
	    }
	
	    cmp = mappingA.originalLine - mappingB.originalLine;
	    if (cmp) {
	      return cmp;
	    }
	
	    cmp = mappingA.originalColumn - mappingB.originalColumn;
	    if (cmp || onlyCompareOriginal) {
	      return cmp;
	    }
	
	    cmp = strcmp(mappingA.name, mappingB.name);
	    if (cmp) {
	      return cmp;
	    }
	
	    cmp = mappingA.generatedLine - mappingB.generatedLine;
	    if (cmp) {
	      return cmp;
	    }
	
	    return mappingA.generatedColumn - mappingB.generatedColumn;
	  };
	  exports.compareByOriginalPositions = compareByOriginalPositions;
	
	  /**
	   * Comparator between two mappings where the generated positions are
	   * compared.
	   *
	   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
	   * mappings with the same generated line and column, but different
	   * source/name/original line and column the same. Useful when searching for a
	   * mapping with a stubbed out mapping.
	   */
	  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
	    var cmp;
	
	    cmp = mappingA.generatedLine - mappingB.generatedLine;
	    if (cmp) {
	      return cmp;
	    }
	
	    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	    if (cmp || onlyCompareGenerated) {
	      return cmp;
	    }
	
	    cmp = strcmp(mappingA.source, mappingB.source);
	    if (cmp) {
	      return cmp;
	    }
	
	    cmp = mappingA.originalLine - mappingB.originalLine;
	    if (cmp) {
	      return cmp;
	    }
	
	    cmp = mappingA.originalColumn - mappingB.originalColumn;
	    if (cmp) {
	      return cmp;
	    }
	
	    return strcmp(mappingA.name, mappingB.name);
	  };
	  exports.compareByGeneratedPositions = compareByGeneratedPositions;
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {
	
	  var util = __webpack_require__(7);
	
	  /**
	   * A data structure which is a combination of an array and a set. Adding a new
	   * member is O(1), testing for membership is O(1), and finding the index of an
	   * element is O(1). Removing elements from the set is not supported. Only
	   * strings are supported for membership.
	   */
	  function ArraySet() {
	    this._array = [];
	    this._set = {};
	  }
	
	  /**
	   * Static method for creating ArraySet instances from an existing array.
	   */
	  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
	    var set = new ArraySet();
	    for (var i = 0, len = aArray.length; i < len; i++) {
	      set.add(aArray[i], aAllowDuplicates);
	    }
	    return set;
	  };
	
	  /**
	   * Add the given string to this set.
	   *
	   * @param String aStr
	   */
	  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
	    var isDuplicate = this.has(aStr);
	    var idx = this._array.length;
	    if (!isDuplicate || aAllowDuplicates) {
	      this._array.push(aStr);
	    }
	    if (!isDuplicate) {
	      this._set[util.toSetString(aStr)] = idx;
	    }
	  };
	
	  /**
	   * Is the given string a member of this set?
	   *
	   * @param String aStr
	   */
	  ArraySet.prototype.has = function ArraySet_has(aStr) {
	    return Object.prototype.hasOwnProperty.call(this._set,
	                                                util.toSetString(aStr));
	  };
	
	  /**
	   * What is the index of the given string in the array?
	   *
	   * @param String aStr
	   */
	  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
	    if (this.has(aStr)) {
	      return this._set[util.toSetString(aStr)];
	    }
	    throw new Error('"' + aStr + '" is not in the set.');
	  };
	
	  /**
	   * What is the element at the given index?
	   *
	   * @param Number aIdx
	   */
	  ArraySet.prototype.at = function ArraySet_at(aIdx) {
	    if (aIdx >= 0 && aIdx < this._array.length) {
	      return this._array[aIdx];
	    }
	    throw new Error('No element indexed by ' + aIdx);
	  };
	
	  /**
	   * Returns the array representation of this set (which has the proper indices
	   * indicated by indexOf). Note that this is a copy of the internal array used
	   * for storing the members so that no one can mess with internal state.
	   */
	  ArraySet.prototype.toArray = function ArraySet_toArray() {
	    return this._array.slice();
	  };
	
	  exports.ArraySet = ArraySet;
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {
	
	  var util = __webpack_require__(7);
	  var binarySearch = __webpack_require__(10);
	  var ArraySet = __webpack_require__(8).ArraySet;
	  var base64VLQ = __webpack_require__(5);
	
	  /**
	   * A SourceMapConsumer instance represents a parsed source map which we can
	   * query for information about the original file positions by giving it a file
	   * position in the generated source.
	   *
	   * The only parameter is the raw source map (either as a JSON string, or
	   * already parsed to an object). According to the spec, source maps have the
	   * following attributes:
	   *
	   *   - version: Which version of the source map spec this map is following.
	   *   - sources: An array of URLs to the original source files.
	   *   - names: An array of identifiers which can be referrenced by individual mappings.
	   *   - sourceRoot: Optional. The URL root from which all sources are relative.
	   *   - sourcesContent: Optional. An array of contents of the original source files.
	   *   - mappings: A string of base64 VLQs which contain the actual mappings.
	   *   - file: The generated file this source map is associated with.
	   *
	   * Here is an example source map, taken from the source map spec[0]:
	   *
	   *     {
	   *       version : 3,
	   *       file: "out.js",
	   *       sourceRoot : "",
	   *       sources: ["foo.js", "bar.js"],
	   *       names: ["src", "maps", "are", "fun"],
	   *       mappings: "AA,AB;;ABCDE;"
	   *     }
	   *
	   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
	   */
	  function SourceMapConsumer(aSourceMap) {
	    var sourceMap = aSourceMap;
	    if (typeof aSourceMap === 'string') {
	      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
	    }
	
	    var version = util.getArg(sourceMap, 'version');
	    var sources = util.getArg(sourceMap, 'sources');
	    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
	    // requires the array) to play nice here.
	    var names = util.getArg(sourceMap, 'names', []);
	    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
	    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
	    var mappings = util.getArg(sourceMap, 'mappings');
	    var file = util.getArg(sourceMap, 'file', null);
	
	    // Once again, Sass deviates from the spec and supplies the version as a
	    // string rather than a number, so we use loose equality checking here.
	    if (version != this._version) {
	      throw new Error('Unsupported version: ' + version);
	    }
	
	    // Pass `true` below to allow duplicate names and sources. While source maps
	    // are intended to be compressed and deduplicated, the TypeScript compiler
	    // sometimes generates source maps with duplicates in them. See Github issue
	    // #72 and bugzil.la/889492.
	    this._names = ArraySet.fromArray(names, true);
	    this._sources = ArraySet.fromArray(sources, true);
	
	    this.sourceRoot = sourceRoot;
	    this.sourcesContent = sourcesContent;
	    this._mappings = mappings;
	    this.file = file;
	  }
	
	  /**
	   * Create a SourceMapConsumer from a SourceMapGenerator.
	   *
	   * @param SourceMapGenerator aSourceMap
	   *        The source map that will be consumed.
	   * @returns SourceMapConsumer
	   */
	  SourceMapConsumer.fromSourceMap =
	    function SourceMapConsumer_fromSourceMap(aSourceMap) {
	      var smc = Object.create(SourceMapConsumer.prototype);
	
	      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
	      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
	      smc.sourceRoot = aSourceMap._sourceRoot;
	      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
	                                                              smc.sourceRoot);
	      smc.file = aSourceMap._file;
	
	      smc.__generatedMappings = aSourceMap._mappings.slice()
	        .sort(util.compareByGeneratedPositions);
	      smc.__originalMappings = aSourceMap._mappings.slice()
	        .sort(util.compareByOriginalPositions);
	
	      return smc;
	    };
	
	  /**
	   * The version of the source mapping spec that we are consuming.
	   */
	  SourceMapConsumer.prototype._version = 3;
	
	  /**
	   * The list of original sources.
	   */
	  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
	    get: function () {
	      return this._sources.toArray().map(function (s) {
	        return this.sourceRoot ? util.join(this.sourceRoot, s) : s;
	      }, this);
	    }
	  });
	
	  // `__generatedMappings` and `__originalMappings` are arrays that hold the
	  // parsed mapping coordinates from the source map's "mappings" attribute. They
	  // are lazily instantiated, accessed via the `_generatedMappings` and
	  // `_originalMappings` getters respectively, and we only parse the mappings
	  // and create these arrays once queried for a source location. We jump through
	  // these hoops because there can be many thousands of mappings, and parsing
	  // them is expensive, so we only want to do it if we must.
	  //
	  // Each object in the arrays is of the form:
	  //
	  //     {
	  //       generatedLine: The line number in the generated code,
	  //       generatedColumn: The column number in the generated code,
	  //       source: The path to the original source file that generated this
	  //               chunk of code,
	  //       originalLine: The line number in the original source that
	  //                     corresponds to this chunk of generated code,
	  //       originalColumn: The column number in the original source that
	  //                       corresponds to this chunk of generated code,
	  //       name: The name of the original symbol which generated this chunk of
	  //             code.
	  //     }
	  //
	  // All properties except for `generatedLine` and `generatedColumn` can be
	  // `null`.
	  //
	  // `_generatedMappings` is ordered by the generated positions.
	  //
	  // `_originalMappings` is ordered by the original positions.
	
	  SourceMapConsumer.prototype.__generatedMappings = null;
	  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
	    get: function () {
	      if (!this.__generatedMappings) {
	        this.__generatedMappings = [];
	        this.__originalMappings = [];
	        this._parseMappings(this._mappings, this.sourceRoot);
	      }
	
	      return this.__generatedMappings;
	    }
	  });
	
	  SourceMapConsumer.prototype.__originalMappings = null;
	  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
	    get: function () {
	      if (!this.__originalMappings) {
	        this.__generatedMappings = [];
	        this.__originalMappings = [];
	        this._parseMappings(this._mappings, this.sourceRoot);
	      }
	
	      return this.__originalMappings;
	    }
	  });
	
	  /**
	   * Parse the mappings in a string in to a data structure which we can easily
	   * query (the ordered arrays in the `this.__generatedMappings` and
	   * `this.__originalMappings` properties).
	   */
	  SourceMapConsumer.prototype._parseMappings =
	    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	      var generatedLine = 1;
	      var previousGeneratedColumn = 0;
	      var previousOriginalLine = 0;
	      var previousOriginalColumn = 0;
	      var previousSource = 0;
	      var previousName = 0;
	      var mappingSeparator = /^[,;]/;
	      var str = aStr;
	      var mapping;
	      var temp;
	
	      while (str.length > 0) {
	        if (str.charAt(0) === ';') {
	          generatedLine++;
	          str = str.slice(1);
	          previousGeneratedColumn = 0;
	        }
	        else if (str.charAt(0) === ',') {
	          str = str.slice(1);
	        }
	        else {
	          mapping = {};
	          mapping.generatedLine = generatedLine;
	
	          // Generated column.
	          temp = base64VLQ.decode(str);
	          mapping.generatedColumn = previousGeneratedColumn + temp.value;
	          previousGeneratedColumn = mapping.generatedColumn;
	          str = temp.rest;
	
	          if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
	            // Original source.
	            temp = base64VLQ.decode(str);
	            mapping.source = this._sources.at(previousSource + temp.value);
	            previousSource += temp.value;
	            str = temp.rest;
	            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
	              throw new Error('Found a source, but no line and column');
	            }
	
	            // Original line.
	            temp = base64VLQ.decode(str);
	            mapping.originalLine = previousOriginalLine + temp.value;
	            previousOriginalLine = mapping.originalLine;
	            // Lines are stored 0-based
	            mapping.originalLine += 1;
	            str = temp.rest;
	            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
	              throw new Error('Found a source and line, but no column');
	            }
	
	            // Original column.
	            temp = base64VLQ.decode(str);
	            mapping.originalColumn = previousOriginalColumn + temp.value;
	            previousOriginalColumn = mapping.originalColumn;
	            str = temp.rest;
	
	            if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
	              // Original name.
	              temp = base64VLQ.decode(str);
	              mapping.name = this._names.at(previousName + temp.value);
	              previousName += temp.value;
	              str = temp.rest;
	            }
	          }
	
	          this.__generatedMappings.push(mapping);
	          if (typeof mapping.originalLine === 'number') {
	            this.__originalMappings.push(mapping);
	          }
	        }
	      }
	
	      this.__generatedMappings.sort(util.compareByGeneratedPositions);
	      this.__originalMappings.sort(util.compareByOriginalPositions);
	    };
	
	  /**
	   * Find the mapping that best matches the hypothetical "needle" mapping that
	   * we are searching for in the given "haystack" of mappings.
	   */
	  SourceMapConsumer.prototype._findMapping =
	    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
	                                           aColumnName, aComparator) {
	      // To return the position we are searching for, we must first find the
	      // mapping for the given position and then return the opposite position it
	      // points to. Because the mappings are sorted, we can use binary search to
	      // find the best mapping.
	
	      if (aNeedle[aLineName] <= 0) {
	        throw new TypeError('Line must be greater than or equal to 1, got '
	                            + aNeedle[aLineName]);
	      }
	      if (aNeedle[aColumnName] < 0) {
	        throw new TypeError('Column must be greater than or equal to 0, got '
	                            + aNeedle[aColumnName]);
	      }
	
	      return binarySearch.search(aNeedle, aMappings, aComparator);
	    };
	
	  /**
	   * Returns the original source, line, and column information for the generated
	   * source's line and column positions provided. The only argument is an object
	   * with the following properties:
	   *
	   *   - line: The line number in the generated source.
	   *   - column: The column number in the generated source.
	   *
	   * and an object is returned with the following properties:
	   *
	   *   - source: The original source file, or null.
	   *   - line: The line number in the original source, or null.
	   *   - column: The column number in the original source, or null.
	   *   - name: The original identifier, or null.
	   */
	  SourceMapConsumer.prototype.originalPositionFor =
	    function SourceMapConsumer_originalPositionFor(aArgs) {
	      var needle = {
	        generatedLine: util.getArg(aArgs, 'line'),
	        generatedColumn: util.getArg(aArgs, 'column')
	      };
	
	      var mapping = this._findMapping(needle,
	                                      this._generatedMappings,
	                                      "generatedLine",
	                                      "generatedColumn",
	                                      util.compareByGeneratedPositions);
	
	      if (mapping) {
	        var source = util.getArg(mapping, 'source', null);
	        if (source && this.sourceRoot) {
	          source = util.join(this.sourceRoot, source);
	        }
	        return {
	          source: source,
	          line: util.getArg(mapping, 'originalLine', null),
	          column: util.getArg(mapping, 'originalColumn', null),
	          name: util.getArg(mapping, 'name', null)
	        };
	      }
	
	      return {
	        source: null,
	        line: null,
	        column: null,
	        name: null
	      };
	    };
	
	  /**
	   * Returns the original source content. The only argument is the url of the
	   * original source file. Returns null if no original source content is
	   * availible.
	   */
	  SourceMapConsumer.prototype.sourceContentFor =
	    function SourceMapConsumer_sourceContentFor(aSource) {
	      if (!this.sourcesContent) {
	        return null;
	      }
	
	      if (this.sourceRoot) {
	        aSource = util.relative(this.sourceRoot, aSource);
	      }
	
	      if (this._sources.has(aSource)) {
	        return this.sourcesContent[this._sources.indexOf(aSource)];
	      }
	
	      var url;
	      if (this.sourceRoot
	          && (url = util.urlParse(this.sourceRoot))) {
	        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
	        // many users. We can help them out when they expect file:// URIs to
	        // behave like it would if they were running a local HTTP server. See
	        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
	        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
	        if (url.scheme == "file"
	            && this._sources.has(fileUriAbsPath)) {
	          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
	        }
	
	        if ((!url.path || url.path == "/")
	            && this._sources.has("/" + aSource)) {
	          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
	        }
	      }
	
	      throw new Error('"' + aSource + '" is not in the SourceMap.');
	    };
	
	  /**
	   * Returns the generated line and column information for the original source,
	   * line, and column positions provided. The only argument is an object with
	   * the following properties:
	   *
	   *   - source: The filename of the original source.
	   *   - line: The line number in the original source.
	   *   - column: The column number in the original source.
	   *
	   * and an object is returned with the following properties:
	   *
	   *   - line: The line number in the generated source, or null.
	   *   - column: The column number in the generated source, or null.
	   */
	  SourceMapConsumer.prototype.generatedPositionFor =
	    function SourceMapConsumer_generatedPositionFor(aArgs) {
	      var needle = {
	        source: util.getArg(aArgs, 'source'),
	        originalLine: util.getArg(aArgs, 'line'),
	        originalColumn: util.getArg(aArgs, 'column')
	      };
	
	      if (this.sourceRoot) {
	        needle.source = util.relative(this.sourceRoot, needle.source);
	      }
	
	      var mapping = this._findMapping(needle,
	                                      this._originalMappings,
	                                      "originalLine",
	                                      "originalColumn",
	                                      util.compareByOriginalPositions);
	
	      if (mapping) {
	        return {
	          line: util.getArg(mapping, 'generatedLine', null),
	          column: util.getArg(mapping, 'generatedColumn', null)
	        };
	      }
	
	      return {
	        line: null,
	        column: null
	      };
	    };
	
	  SourceMapConsumer.GENERATED_ORDER = 1;
	  SourceMapConsumer.ORIGINAL_ORDER = 2;
	
	  /**
	   * Iterate over each mapping between an original source/line/column and a
	   * generated line/column in this source map.
	   *
	   * @param Function aCallback
	   *        The function that is called with each mapping.
	   * @param Object aContext
	   *        Optional. If specified, this object will be the value of `this` every
	   *        time that `aCallback` is called.
	   * @param aOrder
	   *        Either `SourceMapConsumer.GENERATED_ORDER` or
	   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
	   *        iterate over the mappings sorted by the generated file's line/column
	   *        order or the original's source/line/column order, respectively. Defaults to
	   *        `SourceMapConsumer.GENERATED_ORDER`.
	   */
	  SourceMapConsumer.prototype.eachMapping =
	    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
	      var context = aContext || null;
	      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
	
	      var mappings;
	      switch (order) {
	      case SourceMapConsumer.GENERATED_ORDER:
	        mappings = this._generatedMappings;
	        break;
	      case SourceMapConsumer.ORIGINAL_ORDER:
	        mappings = this._originalMappings;
	        break;
	      default:
	        throw new Error("Unknown order of iteration.");
	      }
	
	      var sourceRoot = this.sourceRoot;
	      mappings.map(function (mapping) {
	        var source = mapping.source;
	        if (source && sourceRoot) {
	          source = util.join(sourceRoot, source);
	        }
	        return {
	          source: source,
	          generatedLine: mapping.generatedLine,
	          generatedColumn: mapping.generatedColumn,
	          originalLine: mapping.originalLine,
	          originalColumn: mapping.originalColumn,
	          name: mapping.name
	        };
	      }).forEach(aCallback, context);
	    };
	
	  exports.SourceMapConsumer = SourceMapConsumer;
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {
	
	  /**
	   * Recursive implementation of binary search.
	   *
	   * @param aLow Indices here and lower do not contain the needle.
	   * @param aHigh Indices here and higher do not contain the needle.
	   * @param aNeedle The element being searched for.
	   * @param aHaystack The non-empty array being searched.
	   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
	   */
	  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
	    // This function terminates when one of the following is true:
	    //
	    //   1. We find the exact element we are looking for.
	    //
	    //   2. We did not find the exact element, but we can return the next
	    //      closest element that is less than that element.
	    //
	    //   3. We did not find the exact element, and there is no next-closest
	    //      element which is less than the one we are searching for, so we
	    //      return null.
	    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
	    var cmp = aCompare(aNeedle, aHaystack[mid], true);
	    if (cmp === 0) {
	      // Found the element we are looking for.
	      return aHaystack[mid];
	    }
	    else if (cmp > 0) {
	      // aHaystack[mid] is greater than our needle.
	      if (aHigh - mid > 1) {
	        // The element is in the upper half.
	        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
	      }
	      // We did not find an exact match, return the next closest one
	      // (termination case 2).
	      return aHaystack[mid];
	    }
	    else {
	      // aHaystack[mid] is less than our needle.
	      if (mid - aLow > 1) {
	        // The element is in the lower half.
	        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
	      }
	      // The exact needle element was not found in this haystack. Determine if
	      // we are in termination case (2) or (3) and return the appropriate thing.
	      return aLow < 0
	        ? null
	        : aHaystack[aLow];
	    }
	  }
	
	  /**
	   * This is an implementation of binary search which will always try and return
	   * the next lowest value checked if there is no exact hit. This is because
	   * mappings between original and generated line/col pairs are single points,
	   * and there is an implicit region between each of them, so a miss just means
	   * that you aren't on the very start of a region.
	   *
	   * @param aNeedle The element you are looking for.
	   * @param aHaystack The array that is being searched.
	   * @param aCompare A function which takes the needle and an element in the
	   *     array and returns -1, 0, or 1 depending on whether the needle is less
	   *     than, equal to, or greater than the element, respectively.
	   */
	  exports.search = function search(aNeedle, aHaystack, aCompare) {
	    return aHaystack.length > 0
	      ? recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
	      : null;
	  };
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {
	
	  var SourceMapGenerator = __webpack_require__(4).SourceMapGenerator;
	  var util = __webpack_require__(7);
	
	  /**
	   * SourceNodes provide a way to abstract over interpolating/concatenating
	   * snippets of generated JavaScript source code while maintaining the line and
	   * column information associated with the original source code.
	   *
	   * @param aLine The original line number.
	   * @param aColumn The original column number.
	   * @param aSource The original source's filename.
	   * @param aChunks Optional. An array of strings which are snippets of
	   *        generated JS, or other SourceNodes.
	   * @param aName The original identifier.
	   */
	  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
	    this.children = [];
	    this.sourceContents = {};
	    this.line = aLine === undefined ? null : aLine;
	    this.column = aColumn === undefined ? null : aColumn;
	    this.source = aSource === undefined ? null : aSource;
	    this.name = aName === undefined ? null : aName;
	    if (aChunks != null) this.add(aChunks);
	  }
	
	  /**
	   * Creates a SourceNode from generated code and a SourceMapConsumer.
	   *
	   * @param aGeneratedCode The generated code
	   * @param aSourceMapConsumer The SourceMap for the generated code
	   */
	  SourceNode.fromStringWithSourceMap =
	    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer) {
	      // The SourceNode we want to fill with the generated code
	      // and the SourceMap
	      var node = new SourceNode();
	
	      // The generated code
	      // Processed fragments are removed from this array.
	      var remainingLines = aGeneratedCode.split('\n');
	
	      // We need to remember the position of "remainingLines"
	      var lastGeneratedLine = 1, lastGeneratedColumn = 0;
	
	      // The generate SourceNodes we need a code range.
	      // To extract it current and last mapping is used.
	      // Here we store the last mapping.
	      var lastMapping = null;
	
	      aSourceMapConsumer.eachMapping(function (mapping) {
	        if (lastMapping === null) {
	          // We add the generated code until the first mapping
	          // to the SourceNode without any mapping.
	          // Each line is added as separate string.
	          while (lastGeneratedLine < mapping.generatedLine) {
	            node.add(remainingLines.shift() + "\n");
	            lastGeneratedLine++;
	          }
	          if (lastGeneratedColumn < mapping.generatedColumn) {
	            var nextLine = remainingLines[0];
	            node.add(nextLine.substr(0, mapping.generatedColumn));
	            remainingLines[0] = nextLine.substr(mapping.generatedColumn);
	            lastGeneratedColumn = mapping.generatedColumn;
	          }
	        } else {
	          // We add the code from "lastMapping" to "mapping":
	          // First check if there is a new line in between.
	          if (lastGeneratedLine < mapping.generatedLine) {
	            var code = "";
	            // Associate full lines with "lastMapping"
	            do {
	              code += remainingLines.shift() + "\n";
	              lastGeneratedLine++;
	              lastGeneratedColumn = 0;
	            } while (lastGeneratedLine < mapping.generatedLine);
	            // When we reached the correct line, we add code until we
	            // reach the correct column too.
	            if (lastGeneratedColumn < mapping.generatedColumn) {
	              var nextLine = remainingLines[0];
	              code += nextLine.substr(0, mapping.generatedColumn);
	              remainingLines[0] = nextLine.substr(mapping.generatedColumn);
	              lastGeneratedColumn = mapping.generatedColumn;
	            }
	            // Create the SourceNode.
	            addMappingWithCode(lastMapping, code);
	          } else {
	            // There is no new line in between.
	            // Associate the code between "lastGeneratedColumn" and
	            // "mapping.generatedColumn" with "lastMapping"
	            var nextLine = remainingLines[0];
	            var code = nextLine.substr(0, mapping.generatedColumn -
	                                          lastGeneratedColumn);
	            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
	                                                lastGeneratedColumn);
	            lastGeneratedColumn = mapping.generatedColumn;
	            addMappingWithCode(lastMapping, code);
	          }
	        }
	        lastMapping = mapping;
	      }, this);
	      // We have processed all mappings.
	      // Associate the remaining code in the current line with "lastMapping"
	      // and add the remaining lines without any mapping
	      addMappingWithCode(lastMapping, remainingLines.join("\n"));
	
	      // Copy sourcesContent into SourceNode
	      aSourceMapConsumer.sources.forEach(function (sourceFile) {
	        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	        if (content) {
	          node.setSourceContent(sourceFile, content);
	        }
	      });
	
	      return node;
	
	      function addMappingWithCode(mapping, code) {
	        if (mapping === null || mapping.source === undefined) {
	          node.add(code);
	        } else {
	          node.add(new SourceNode(mapping.originalLine,
	                                  mapping.originalColumn,
	                                  mapping.source,
	                                  code,
	                                  mapping.name));
	        }
	      }
	    };
	
	  /**
	   * Add a chunk of generated JS to this source node.
	   *
	   * @param aChunk A string snippet of generated JS code, another instance of
	   *        SourceNode, or an array where each member is one of those things.
	   */
	  SourceNode.prototype.add = function SourceNode_add(aChunk) {
	    if (Array.isArray(aChunk)) {
	      aChunk.forEach(function (chunk) {
	        this.add(chunk);
	      }, this);
	    }
	    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
	      if (aChunk) {
	        this.children.push(aChunk);
	      }
	    }
	    else {
	      throw new TypeError(
	        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
	      );
	    }
	    return this;
	  };
	
	  /**
	   * Add a chunk of generated JS to the beginning of this source node.
	   *
	   * @param aChunk A string snippet of generated JS code, another instance of
	   *        SourceNode, or an array where each member is one of those things.
	   */
	  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
	    if (Array.isArray(aChunk)) {
	      for (var i = aChunk.length-1; i >= 0; i--) {
	        this.prepend(aChunk[i]);
	      }
	    }
	    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
	      this.children.unshift(aChunk);
	    }
	    else {
	      throw new TypeError(
	        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
	      );
	    }
	    return this;
	  };
	
	  /**
	   * Walk over the tree of JS snippets in this node and its children. The
	   * walking function is called once for each snippet of JS and is passed that
	   * snippet and the its original associated source's line/column location.
	   *
	   * @param aFn The traversal function.
	   */
	  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
	    var chunk;
	    for (var i = 0, len = this.children.length; i < len; i++) {
	      chunk = this.children[i];
	      if (chunk instanceof SourceNode) {
	        chunk.walk(aFn);
	      }
	      else {
	        if (chunk !== '') {
	          aFn(chunk, { source: this.source,
	                       line: this.line,
	                       column: this.column,
	                       name: this.name });
	        }
	      }
	    }
	  };
	
	  /**
	   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
	   * each of `this.children`.
	   *
	   * @param aSep The separator.
	   */
	  SourceNode.prototype.join = function SourceNode_join(aSep) {
	    var newChildren;
	    var i;
	    var len = this.children.length;
	    if (len > 0) {
	      newChildren = [];
	      for (i = 0; i < len-1; i++) {
	        newChildren.push(this.children[i]);
	        newChildren.push(aSep);
	      }
	      newChildren.push(this.children[i]);
	      this.children = newChildren;
	    }
	    return this;
	  };
	
	  /**
	   * Call String.prototype.replace on the very right-most source snippet. Useful
	   * for trimming whitespace from the end of a source node, etc.
	   *
	   * @param aPattern The pattern to replace.
	   * @param aReplacement The thing to replace the pattern with.
	   */
	  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
	    var lastChild = this.children[this.children.length - 1];
	    if (lastChild instanceof SourceNode) {
	      lastChild.replaceRight(aPattern, aReplacement);
	    }
	    else if (typeof lastChild === 'string') {
	      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
	    }
	    else {
	      this.children.push(''.replace(aPattern, aReplacement));
	    }
	    return this;
	  };
	
	  /**
	   * Set the source content for a source file. This will be added to the SourceMapGenerator
	   * in the sourcesContent field.
	   *
	   * @param aSourceFile The filename of the source file
	   * @param aSourceContent The content of the source file
	   */
	  SourceNode.prototype.setSourceContent =
	    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
	      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
	    };
	
	  /**
	   * Walk over the tree of SourceNodes. The walking function is called for each
	   * source file content and is passed the filename and source content.
	   *
	   * @param aFn The traversal function.
	   */
	  SourceNode.prototype.walkSourceContents =
	    function SourceNode_walkSourceContents(aFn) {
	      for (var i = 0, len = this.children.length; i < len; i++) {
	        if (this.children[i] instanceof SourceNode) {
	          this.children[i].walkSourceContents(aFn);
	        }
	      }
	
	      var sources = Object.keys(this.sourceContents);
	      for (var i = 0, len = sources.length; i < len; i++) {
	        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
	      }
	    };
	
	  /**
	   * Return the string representation of this source node. Walks over the tree
	   * and concatenates all the various snippets together to one string.
	   */
	  SourceNode.prototype.toString = function SourceNode_toString() {
	    var str = "";
	    this.walk(function (chunk) {
	      str += chunk;
	    });
	    return str;
	  };
	
	  /**
	   * Returns the string representation of this source node along with a source
	   * map.
	   */
	  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
	    var generated = {
	      code: "",
	      line: 1,
	      column: 0
	    };
	    var map = new SourceMapGenerator(aArgs);
	    var sourceMappingActive = false;
	    var lastOriginalSource = null;
	    var lastOriginalLine = null;
	    var lastOriginalColumn = null;
	    var lastOriginalName = null;
	    this.walk(function (chunk, original) {
	      generated.code += chunk;
	      if (original.source !== null
	          && original.line !== null
	          && original.column !== null) {
	        if(lastOriginalSource !== original.source
	           || lastOriginalLine !== original.line
	           || lastOriginalColumn !== original.column
	           || lastOriginalName !== original.name) {
	          map.addMapping({
	            source: original.source,
	            original: {
	              line: original.line,
	              column: original.column
	            },
	            generated: {
	              line: generated.line,
	              column: generated.column
	            },
	            name: original.name
	          });
	        }
	        lastOriginalSource = original.source;
	        lastOriginalLine = original.line;
	        lastOriginalColumn = original.column;
	        lastOriginalName = original.name;
	        sourceMappingActive = true;
	      } else if (sourceMappingActive) {
	        map.addMapping({
	          generated: {
	            line: generated.line,
	            column: generated.column
	          }
	        });
	        lastOriginalSource = null;
	        sourceMappingActive = false;
	      }
	      chunk.split('').forEach(function (ch) {
	        if (ch === '\n') {
	          generated.line++;
	          generated.column = 0;
	        } else {
	          generated.column++;
	        }
	      });
	    });
	    this.walkSourceContents(function (sourceFile, sourceContent) {
	      map.setSourceContent(sourceFile, sourceContent);
	    });
	
	    return { code: generated.code, map: map };
	  };
	
	  exports.SourceNode = SourceNode;
	
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = require("electron");

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _electron = __webpack_require__(14);
	
	var _path = __webpack_require__(12);
	
	var _path2 = _interopRequireDefault(_path);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function createLoginWindow(loginCallback) {
	    var loginWindow = new _electron.BrowserWindow({
	        width: 300,
	        height: 400,
	        frame: false,
	        resizable: false
	    });
	    loginWindow.loadURL('file://' + _path2.default.join(__dirname, '/static/login/login.html'));
	
	    _electron.ipcMain.once('login-message', function (event, usernameAndPassword) {
	        loginCallback(usernameAndPassword[0], usernameAndPassword[1]);
	        loginWindow.close();
	    });
	    return loginWindow;
	}
	
	exports.default = createLoginWindow;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _fs = __webpack_require__(13);
	
	var _fs2 = _interopRequireDefault(_fs);
	
	var _path = __webpack_require__(12);
	
	var _path2 = _interopRequireDefault(_path);
	
	var _electron = __webpack_require__(14);
	
	var _electronWindowState = __webpack_require__(17);
	
	var _electronWindowState2 = _interopRequireDefault(_electronWindowState);
	
	var _helpers = __webpack_require__(24);
	
	var _helpers2 = _interopRequireDefault(_helpers);
	
	var _menu = __webpack_require__(27);
	
	var _menu2 = _interopRequireDefault(_menu);
	
	var _contextMenu = __webpack_require__(28);
	
	var _contextMenu2 = _interopRequireDefault(_contextMenu);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var isOSX = _helpers2.default.isOSX;
	var linkIsInternal = _helpers2.default.linkIsInternal;
	var getCssToInject = _helpers2.default.getCssToInject;
	var shouldInjectCss = _helpers2.default.shouldInjectCss;
	
	
	var ZOOM_INTERVAL = 0.1;
	
	/**
	 *
	 * @param {{}} options AppArgs from nativefier.json
	 * @param {function} onAppQuit
	 * @param {function} setDockBadge
	 * @returns {electron.BrowserWindow}
	 */
	function createMainWindow(options, onAppQuit, setDockBadge) {
	    var _this = this;
	
	    var mainWindowState = (0, _electronWindowState2.default)({
	        defaultWidth: options.width || 1280,
	        defaultHeight: options.height || 800
	    });
	
	    var mainWindow = new _electron.BrowserWindow({
	        frame: !options.hideWindowFrame,
	        width: mainWindowState.width,
	        height: mainWindowState.height,
	        minWidth: options.minWidth,
	        minHeight: options.minHeight,
	        maxWidth: options.maxWidth,
	        maxHeight: options.maxHeight,
	        x: mainWindowState.x,
	        y: mainWindowState.y,
	        autoHideMenuBar: !options.showMenuBar,
	        // Convert dashes to spaces because on linux the app name is joined with dashes
	        title: options.name,
	        webPreferences: {
	            javascript: true,
	            plugins: true,
	            // node globals causes problems with sites like messenger.com
	            nodeIntegration: false,
	            webSecurity: !options.insecure,
	            preload: _path2.default.join(__dirname, 'static', 'preload.js')
	        },
	        // after webpack path here should reference `resources/app/`
	        icon: _path2.default.join(__dirname, '../', '/icon.png'),
	        // set to undefined and not false because explicitly setting to false will disable full screen
	        fullscreen: options.fullScreen || undefined
	    });
	
	    mainWindowState.manage(mainWindow);
	
	    // after first run, no longer force full screen to be true
	    if (options.fullScreen) {
	        options.fullScreen = undefined;
	        _fs2.default.writeFileSync(_path2.default.join(__dirname, '..', 'nativefier.json'), JSON.stringify(options));
	    }
	
	    // after first run, no longer force maximize to be true
	    if (options.maximize) {
	        mainWindow.maximize();
	        options.maximize = undefined;
	        _fs2.default.writeFileSync(_path2.default.join(__dirname, '..', 'nativefier.json'), JSON.stringify(options));
	    }
	
	    var currentZoom = 1;
	
	    var onZoomIn = function onZoomIn() {
	        currentZoom += ZOOM_INTERVAL;
	        mainWindow.webContents.send('change-zoom', currentZoom);
	    };
	
	    var onZoomOut = function onZoomOut() {
	        currentZoom -= ZOOM_INTERVAL;
	        mainWindow.webContents.send('change-zoom', currentZoom);
	    };
	
	    var clearAppData = function clearAppData() {
	        _electron.dialog.showMessageBox(mainWindow, {
	            type: 'warning',
	            buttons: ['Yes', 'Cancel'],
	            defaultId: 1,
	            title: 'Clear cache confirmation',
	            message: 'This will clear all data (cookies, local storage etc) from this app. Are you sure you wish to proceed?'
	        }, function (response) {
	            if (response === 0) {
	                (function () {
	                    var session = mainWindow.webContents.session;
	                    session.clearStorageData(function () {
	                        session.clearCache(function () {
	                            mainWindow.loadURL(options.targetUrl);
	                        });
	                    });
	                })();
	            }
	        });
	    };
	
	    var onGoBack = function onGoBack() {
	        mainWindow.webContents.goBack();
	    };
	
	    var onGoForward = function onGoForward() {
	        mainWindow.webContents.goForward();
	    };
	
	    var getCurrentUrl = function getCurrentUrl() {
	        return mainWindow.webContents.getURL();
	    };
	
	    var menuOptions = {
	        nativefierVersion: options.nativefierVersion,
	        appQuit: onAppQuit,
	        zoomIn: onZoomIn,
	        zoomOut: onZoomOut,
	        goBack: onGoBack,
	        goForward: onGoForward,
	        getCurrentUrl: getCurrentUrl,
	        clearAppData: clearAppData,
	        disableDevTools: options.disableDevTools
	    };
	
	    (0, _menu2.default)(menuOptions);
	    if (!options.disableContextMenu) {
	        (0, _contextMenu2.default)(mainWindow);
	    }
	
	    if (options.userAgent) {
	        mainWindow.webContents.setUserAgent(options.userAgent);
	    }
	
	    maybeInjectCss(mainWindow);
	    mainWindow.webContents.on('did-finish-load', function () {
	        mainWindow.webContents.send('params', JSON.stringify(options));
	    });
	
	    if (options.counter) {
	        mainWindow.on('page-title-updated', function () {
	            if (mainWindow.isFocused()) {
	                return;
	            }
	
	            if (options.counter) {
	                var itemCountRegex = /[\(\[{](\d*?)[}\]\)]/;
	                var match = itemCountRegex.exec(mainWindow.getTitle());
	                if (match) {
	                    setDockBadge(match[1]);
	                }
	                return;
	            }
	            setDockBadge('●');
	        });
	    }
	
	    mainWindow.webContents.on('new-window', function (event, urlToGo) {
	        if (mainWindow.useDefaultWindowBehaviour) {
	            mainWindow.useDefaultWindowBehaviour = false;
	            return;
	        }
	
	        if (linkIsInternal(options.targetUrl, urlToGo)) {
	            return;
	        }
	        event.preventDefault();
	        _electron.shell.openExternal(urlToGo);
	    });
	
	    mainWindow.loadURL(options.targetUrl);
	
	    mainWindow.on('focus', function () {
	        setDockBadge('');
	    });
	
	    mainWindow.on('close', function (event) {
	        if (mainWindow.isFullScreen()) {
	            mainWindow.setFullScreen(false);
	            mainWindow.once('leave-full-screen', maybeHideWindow.bind(_this, mainWindow, event, options.fastQuit));
	        }
	        maybeHideWindow(mainWindow, event, options.fastQuit);
	    });
	
	    return mainWindow;
	}
	
	_electron.ipcMain.on('cancelNewWindowOverride', function () {
	    var allWindows = _electron.BrowserWindow.getAllWindows();
	    allWindows.forEach(function (window) {
	        window.useDefaultWindowBehaviour = false;
	    });
	});
	
	function maybeHideWindow(window, event, fastQuit) {
	    if (isOSX() && !fastQuit) {
	        // this is called when exiting from clicking the cross button on the window
	        event.preventDefault();
	        window.hide();
	    }
	    // will close the window on other platforms
	}
	
	function maybeInjectCss(browserWindow) {
	    if (!shouldInjectCss()) {
	        return;
	    }
	
	    var cssToInject = getCssToInject();
	
	    var injectCss = function injectCss() {
	        browserWindow.webContents.insertCSS(cssToInject);
	    };
	
	    browserWindow.webContents.on('did-finish-load', function () {
	        // remove the injection of css the moment the page is loaded
	        browserWindow.webContents.removeListener('did-get-response-details', injectCss);
	    });
	
	    // on every page navigation inject the css
	    browserWindow.webContents.on('did-navigate', function () {
	        // we have to inject the css in did-get-response-details to prevent the fouc
	        // will run multiple times
	        browserWindow.webContents.on('did-get-response-details', injectCss);
	    });
	}
	
	exports.default = createMainWindow;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var electron = __webpack_require__(14);
	var app = electron.app;
	var jsonfile = __webpack_require__(18);
	var path = __webpack_require__(12);
	var mkdirp = __webpack_require__(19);
	var objectAssign = __webpack_require__(20);
	var deepEqual = __webpack_require__(21);
	
	module.exports = function (options) {
	  var screen = electron.screen;
	  var state;
	  var winRef;
	  var stateChangeTimer;
	  var eventHandlingDelay = 100;
	  var config = objectAssign({
	    file: 'window-state.json',
	    path: app.getPath('userData'),
	    maximize: true,
	    fullScreen: true
	  }, options);
	  var fullStoreFileName = path.join(config.path, config.file);
	
	  function isNormal(win) {
	    return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen();
	  }
	
	  function hasBounds() {
	    return state &&
	      state.x !== undefined &&
	      state.y !== undefined &&
	      state.width !== undefined &&
	      state.height !== undefined;
	  }
	
	  function validateState() {
	    var isValid = state && hasBounds();
	    if (isValid && state.displayBounds) {
	      // Check if the display where the window was last open is still available
	      var displayBounds = screen.getDisplayMatching(state).bounds;
	      isValid = deepEqual(state.displayBounds, displayBounds, {strict: true});
	    }
	    return isValid;
	  }
	
	  function updateState(win) {
	    win = win || winRef;
	    if (!win) {
	      return;
	    }
	
	    var winBounds = win.getBounds();
	    if (isNormal(win)) {
	      state.x = winBounds.x;
	      state.y = winBounds.y;
	      state.width = winBounds.width;
	      state.height = winBounds.height;
	    }
	    state.isMaximized = win.isMaximized();
	    state.isFullScreen = win.isFullScreen();
	    state.displayBounds = screen.getDisplayMatching(winBounds).bounds;
	  }
	
	  function saveState(win) {
	    // Update window state only if it was provided
	    if (win) {
	      updateState(win);
	    }
	
	    // Save state
	    try {
	      mkdirp.sync(path.dirname(fullStoreFileName));
	      jsonfile.writeFileSync(fullStoreFileName, state);
	    } catch (e) {
	      // Don't care
	    }
	  }
	
	  function stateChangeHandler() {
	    // Handles both 'resize' and 'move'
	    clearTimeout(stateChangeTimer);
	    stateChangeTimer = setTimeout(updateState, eventHandlingDelay);
	  }
	
	  function closeHandler() {
	    updateState();
	  }
	
	  function closedHandler() {
	    // Unregister listeners and save state
	    unmanage();
	    saveState();
	  }
	
	  function manage(win) {
	    if (config.maximize && state.isMaximized) {
	      win.maximize();
	    }
	    if (config.fullScreen && state.isFullScreen) {
	      win.setFullScreen(true);
	    }
	    win.on('resize', stateChangeHandler);
	    win.on('move', stateChangeHandler);
	    win.on('close', closeHandler);
	    win.on('closed', closedHandler);
	    winRef = win;
	  }
	
	  function unmanage() {
	    if (winRef) {
	      winRef.removeListener('resize', stateChangeHandler);
	      winRef.removeListener('move', stateChangeHandler);
	      clearTimeout(stateChangeTimer);
	      winRef.removeListener('close', closeHandler);
	      winRef.removeListener('closed', closedHandler);
	      winRef = null;
	    }
	  }
	
	  // Load previous state
	  try {
	    state = jsonfile.readFileSync(fullStoreFileName);
	  } catch (err) {
	    // Don't care
	  }
	
	  // Check state validity
	  if (!validateState()) {
	    state = null;
	  }
	
	  // Set state fallback values
	  state = objectAssign({
	    width: config.defaultWidth || 800,
	    height: config.defaultHeight || 600
	  }, state);
	
	  return {
	    get x() { return state.x; },
	    get y() { return state.y; },
	    get width() { return state.width; },
	    get height() { return state.height; },
	    get isMaximized() { return state.isMaximized; },
	    get isFullScreen() { return state.isFullScreen; },
	    saveState: saveState,
	    unmanage: unmanage,
	    manage: manage
	  };
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var _fs = __webpack_require__(13)
	
	function readFile (file, options, callback) {
	  if (callback == null) {
	    callback = options
	    options = {}
	  }
	
	  if (typeof options === 'string') {
	    options = {encoding: options}
	  }
	
	  options = options || {}
	  var fs = options.fs || _fs
	
	  var shouldThrow = true
	  // DO NOT USE 'passParsingErrors' THE NAME WILL CHANGE!!!, use 'throws' instead
	  if ('passParsingErrors' in options) {
	    shouldThrow = options.passParsingErrors
	  } else if ('throws' in options) {
	    shouldThrow = options.throws
	  }
	
	  fs.readFile(file, options, function (err, data) {
	    if (err) return callback(err)
	
	    data = stripBom(data)
	
	    var obj
	    try {
	      obj = JSON.parse(data, options ? options.reviver : null)
	    } catch (err2) {
	      if (shouldThrow) {
	        err2.message = file + ': ' + err2.message
	        return callback(err2)
	      } else {
	        return callback(null, null)
	      }
	    }
	
	    callback(null, obj)
	  })
	}
	
	function readFileSync (file, options) {
	  options = options || {}
	  if (typeof options === 'string') {
	    options = {encoding: options}
	  }
	
	  var fs = options.fs || _fs
	
	  var shouldThrow = true
	  // DO NOT USE 'passParsingErrors' THE NAME WILL CHANGE!!!, use 'throws' instead
	  if ('passParsingErrors' in options) {
	    shouldThrow = options.passParsingErrors
	  } else if ('throws' in options) {
	    shouldThrow = options.throws
	  }
	
	  var content = fs.readFileSync(file, options)
	  content = stripBom(content)
	
	  try {
	    return JSON.parse(content, options.reviver)
	  } catch (err) {
	    if (shouldThrow) {
	      err.message = file + ': ' + err.message
	      throw err
	    } else {
	      return null
	    }
	  }
	}
	
	function writeFile (file, obj, options, callback) {
	  if (callback == null) {
	    callback = options
	    options = {}
	  }
	  options = options || {}
	  var fs = options.fs || _fs
	
	  var spaces = typeof options === 'object' && options !== null
	    ? 'spaces' in options
	    ? options.spaces : this.spaces
	    : this.spaces
	
	  var str = ''
	  try {
	    str = JSON.stringify(obj, options ? options.replacer : null, spaces) + '\n'
	  } catch (err) {
	    if (callback) return callback(err, null)
	  }
	
	  fs.writeFile(file, str, options, callback)
	}
	
	function writeFileSync (file, obj, options) {
	  options = options || {}
	  var fs = options.fs || _fs
	
	  var spaces = typeof options === 'object' && options !== null
	    ? 'spaces' in options
	    ? options.spaces : this.spaces
	    : this.spaces
	
	  var str = JSON.stringify(obj, options.replacer, spaces) + '\n'
	  // not sure if fs.writeFileSync returns anything, but just in case
	  return fs.writeFileSync(file, str, options)
	}
	
	function stripBom (content) {
	  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
	  if (Buffer.isBuffer(content)) content = content.toString('utf8')
	  content = content.replace(/^\uFEFF/, '')
	  return content
	}
	
	var jsonfile = {
	  spaces: null,
	  readFile: readFile,
	  readFileSync: readFileSync,
	  writeFile: writeFile,
	  writeFileSync: writeFileSync
	}
	
	module.exports = jsonfile


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var path = __webpack_require__(12);
	var fs = __webpack_require__(13);
	var _0777 = parseInt('0777', 8);
	
	module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
	
	function mkdirP (p, opts, f, made) {
	    if (typeof opts === 'function') {
	        f = opts;
	        opts = {};
	    }
	    else if (!opts || typeof opts !== 'object') {
	        opts = { mode: opts };
	    }
	    
	    var mode = opts.mode;
	    var xfs = opts.fs || fs;
	    
	    if (mode === undefined) {
	        mode = _0777 & (~process.umask());
	    }
	    if (!made) made = null;
	    
	    var cb = f || function () {};
	    p = path.resolve(p);
	    
	    xfs.mkdir(p, mode, function (er) {
	        if (!er) {
	            made = made || p;
	            return cb(null, made);
	        }
	        switch (er.code) {
	            case 'ENOENT':
	                mkdirP(path.dirname(p), opts, function (er, made) {
	                    if (er) cb(er, made);
	                    else mkdirP(p, opts, cb, made);
	                });
	                break;
	
	            // In the case of any other error, just see if there's a dir
	            // there already.  If so, then hooray!  If not, then something
	            // is borked.
	            default:
	                xfs.stat(p, function (er2, stat) {
	                    // if the stat fails, then that's super weird.
	                    // let the original error be the failure reason.
	                    if (er2 || !stat.isDirectory()) cb(er, made)
	                    else cb(null, made);
	                });
	                break;
	        }
	    });
	}
	
	mkdirP.sync = function sync (p, opts, made) {
	    if (!opts || typeof opts !== 'object') {
	        opts = { mode: opts };
	    }
	    
	    var mode = opts.mode;
	    var xfs = opts.fs || fs;
	    
	    if (mode === undefined) {
	        mode = _0777 & (~process.umask());
	    }
	    if (!made) made = null;
	
	    p = path.resolve(p);
	
	    try {
	        xfs.mkdirSync(p, mode);
	        made = made || p;
	    }
	    catch (err0) {
	        switch (err0.code) {
	            case 'ENOENT' :
	                made = sync(path.dirname(p), opts, made);
	                sync(p, opts, made);
	                break;
	
	            // In the case of any other error, just see if there's a dir
	            // there already.  If so, then hooray!  If not, then something
	            // is borked.
	            default:
	                var stat;
	                try {
	                    stat = xfs.statSync(p);
	                }
	                catch (err1) {
	                    throw err0;
	                }
	                if (!stat.isDirectory()) throw err0;
	                break;
	        }
	    }
	
	    return made;
	};


/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;
	
	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}
	
		return Object(val);
	}
	
	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}
	
			// Detect buggy property enumeration order in older V8 versions.
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}
	
			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}
	
	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;
	
		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);
	
			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}
	
			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}
	
		return to;
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var pSlice = Array.prototype.slice;
	var objectKeys = __webpack_require__(22);
	var isArguments = __webpack_require__(23);
	
	var deepEqual = module.exports = function (actual, expected, opts) {
	  if (!opts) opts = {};
	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (actual === expected) {
	    return true;
	
	  } else if (actual instanceof Date && expected instanceof Date) {
	    return actual.getTime() === expected.getTime();
	
	  // 7.3. Other pairs that do not both pass typeof value == 'object',
	  // equivalence is determined by ==.
	  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
	    return opts.strict ? actual === expected : actual == expected;
	
	  // 7.4. For all other Object pairs, including Array objects, equivalence is
	  // determined by having the same number of owned properties (as verified
	  // with Object.prototype.hasOwnProperty.call), the same set of keys
	  // (although not necessarily the same order), equivalent values for every
	  // corresponding key, and an identical 'prototype' property. Note: this
	  // accounts for both named and indexed properties on Arrays.
	  } else {
	    return objEquiv(actual, expected, opts);
	  }
	}
	
	function isUndefinedOrNull(value) {
	  return value === null || value === undefined;
	}
	
	function isBuffer (x) {
	  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
	  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
	    return false;
	  }
	  if (x.length > 0 && typeof x[0] !== 'number') return false;
	  return true;
	}
	
	function objEquiv(a, b, opts) {
	  var i, key;
	  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
	    return false;
	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) return false;
	  //~~~I've managed to break Object.keys through screwy arguments passing.
	  //   Converting to array solves the problem.
	  if (isArguments(a)) {
	    if (!isArguments(b)) {
	      return false;
	    }
	    a = pSlice.call(a);
	    b = pSlice.call(b);
	    return deepEqual(a, b, opts);
	  }
	  if (isBuffer(a)) {
	    if (!isBuffer(b)) {
	      return false;
	    }
	    if (a.length !== b.length) return false;
	    for (i = 0; i < a.length; i++) {
	      if (a[i] !== b[i]) return false;
	    }
	    return true;
	  }
	  try {
	    var ka = objectKeys(a),
	        kb = objectKeys(b);
	  } catch (e) {//happens when one is a string literal and the other isn't
	    return false;
	  }
	  // having the same number of owned properties (keys incorporates
	  // hasOwnProperty)
	  if (ka.length != kb.length)
	    return false;
	  //the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  //~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i])
	      return false;
	  }
	  //equivalent values for every corresponding key, and
	  //~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!deepEqual(a[key], b[key], opts)) return false;
	  }
	  return typeof a === typeof b;
	}


/***/ },
/* 22 */
/***/ function(module, exports) {

	exports = module.exports = typeof Object.keys === 'function'
	  ? Object.keys : shim;
	
	exports.shim = shim;
	function shim (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	}


/***/ },
/* 23 */
/***/ function(module, exports) {

	var supportsArgumentsClass = (function(){
	  return Object.prototype.toString.call(arguments)
	})() == '[object Arguments]';
	
	exports = module.exports = supportsArgumentsClass ? supported : unsupported;
	
	exports.supported = supported;
	function supported(object) {
	  return Object.prototype.toString.call(object) == '[object Arguments]';
	};
	
	exports.unsupported = unsupported;
	function unsupported(object){
	  return object &&
	    typeof object == 'object' &&
	    typeof object.length == 'number' &&
	    Object.prototype.hasOwnProperty.call(object, 'callee') &&
	    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
	    false;
	};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _wurl = __webpack_require__(25);
	
	var _wurl2 = _interopRequireDefault(_wurl);
	
	var _os = __webpack_require__(26);
	
	var _os2 = _interopRequireDefault(_os);
	
	var _fs = __webpack_require__(13);
	
	var _fs2 = _interopRequireDefault(_fs);
	
	var _path = __webpack_require__(12);
	
	var _path2 = _interopRequireDefault(_path);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var INJECT_CSS_PATH = _path2.default.join(__dirname, '..', 'inject/inject.css');
	
	function isOSX() {
	    return _os2.default.platform() === 'darwin';
	}
	
	function isLinux() {
	    return _os2.default.platform() === 'linux';
	}
	
	function isWindows() {
	    return _os2.default.platform() === 'win32';
	}
	
	function linkIsInternal(currentUrl, newUrl) {
	    var currentDomain = (0, _wurl2.default)('domain', currentUrl);
	    var newDomain = (0, _wurl2.default)('domain', newUrl);
	    return currentDomain === newDomain;
	}
	
	function shouldInjectCss() {
	    try {
	        _fs2.default.accessSync(INJECT_CSS_PATH, _fs2.default.F_OK);
	        return true;
	    } catch (e) {
	        return false;
	    }
	}
	
	function getCssToInject() {
	    return _fs2.default.readFileSync(INJECT_CSS_PATH).toString();
	}
	
	/**
	 * Helper method to print debug messages from the main process in the browser window
	 * @param {BrowserWindow} browserWindow
	 * @param message
	 */
	function debugLog(browserWindow, message) {
	    // need the timeout as it takes time for the preload javascript to be loaded in the window
	    setTimeout(function () {
	        browserWindow.webContents.send('debug', message);
	    }, 3000);
	    console.log(message);
	}
	
	exports.default = {
	    isOSX: isOSX,
	    isLinux: isLinux,
	    isWindows: isWindows,
	    linkIsInternal: linkIsInternal,
	    getCssToInject: getCssToInject,
	    debugLog: debugLog,
	    shouldInjectCss: shouldInjectCss
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = function (arg, url) {
	
	    function _t() {
	        return new RegExp(/(.*?)\.?([^\.]*?)\.?(com|net|org|biz|ws|in|me|co\.uk|co|org\.uk|ltd\.uk|plc\.uk|me\.uk|edu|mil|br\.com|cn\.com|eu\.com|hu\.com|no\.com|qc\.com|sa\.com|se\.com|se\.net|us\.com|uy\.com|ac|co\.ac|gv\.ac|or\.ac|ac\.ac|af|am|as|at|ac\.at|co\.at|gv\.at|or\.at|asn\.au|com\.au|edu\.au|org\.au|net\.au|id\.au|be|ac\.be|adm\.br|adv\.br|am\.br|arq\.br|art\.br|bio\.br|cng\.br|cnt\.br|com\.br|ecn\.br|eng\.br|esp\.br|etc\.br|eti\.br|fm\.br|fot\.br|fst\.br|g12\.br|gov\.br|ind\.br|inf\.br|jor\.br|lel\.br|med\.br|mil\.br|net\.br|nom\.br|ntr\.br|odo\.br|org\.br|ppg\.br|pro\.br|psc\.br|psi\.br|rec\.br|slg\.br|tmp\.br|tur\.br|tv\.br|vet\.br|zlg\.br|br|ab\.ca|bc\.ca|mb\.ca|nb\.ca|nf\.ca|ns\.ca|nt\.ca|on\.ca|pe\.ca|qc\.ca|sk\.ca|yk\.ca|ca|cc|ac\.cn|com\.cn|edu\.cn|gov\.cn|org\.cn|bj\.cn|sh\.cn|tj\.cn|cq\.cn|he\.cn|nm\.cn|ln\.cn|jl\.cn|hl\.cn|js\.cn|zj\.cn|ah\.cn|gd\.cn|gx\.cn|hi\.cn|sc\.cn|gz\.cn|yn\.cn|xz\.cn|sn\.cn|gs\.cn|qh\.cn|nx\.cn|xj\.cn|tw\.cn|hk\.cn|mo\.cn|cn|cx|cz|de|dk|fo|com\.ec|tm\.fr|com\.fr|asso\.fr|presse\.fr|fr|gf|gs|co\.il|net\.il|ac\.il|k12\.il|gov\.il|muni\.il|ac\.in|co\.in|org\.in|ernet\.in|gov\.in|net\.in|res\.in|is|it|ac\.jp|co\.jp|go\.jp|or\.jp|ne\.jp|ac\.kr|co\.kr|go\.kr|ne\.kr|nm\.kr|or\.kr|li|lt|lu|asso\.mc|tm\.mc|com\.mm|org\.mm|net\.mm|edu\.mm|gov\.mm|ms|nl|no|nu|pl|ro|org\.ro|store\.ro|tm\.ro|firm\.ro|www\.ro|arts\.ro|rec\.ro|info\.ro|nom\.ro|nt\.ro|se|si|com\.sg|org\.sg|net\.sg|gov\.sg|sk|st|tf|ac\.th|co\.th|go\.th|mi\.th|net\.th|or\.th|tm|to|com\.tr|edu\.tr|gov\.tr|k12\.tr|net\.tr|org\.tr|com\.tw|org\.tw|net\.tw|ac\.uk|uk\.com|uk\.net|gb\.com|gb\.net|vg|sh|kz|ch|info|ua|gov|name|pro|ie|hk|com\.hk|org\.hk|net\.hk|edu\.hk|us|tk|cd|by|ad|lv|eu\.lv|bz|es|jp|cl|ag|mobi|eu|co\.nz|org\.nz|net\.nz|maori\.nz|iwi\.nz|io|la|md|sc|sg|vc|tw|travel|my|se|tv|pt|com\.pt|edu\.pt|asia|fi|com\.ve|net\.ve|fi|org\.ve|web\.ve|info\.ve|co\.ve|tel|im|gr|ru|net\.ru|org\.ru|hr|com\.hr|ly|xyz)$/);
	    }
	
	    function _d(s) {
	      return decodeURIComponent(s.replace(/\+/g, ' '));
	    }
	
	    function _i(arg, str) {
	        var sptr = arg.charAt(0),
	            split = str.split(sptr);
	
	        if (sptr === arg) { return split; }
	
	        arg = parseInt(arg.substring(1), 10);
	
	        return split[arg < 0 ? split.length + arg : arg - 1];
	    }
	
	    function _f(arg, str) {
	        var sptr = arg.charAt(0),
	            split = str.split('&'),
	            field = [],
	            params = {},
	            tmp = [],
	            arg2 = arg.substring(1);
	
	        for (var i in split) {
	            field = split[i].split(/=(.*)/);
	
	            if (field[0].replace(/\s/g, '') !== '') {
	                field[1] = _d(field[1] || '');
	
	                // If we have a match just return it right away.
	                if (arg2 === field[0]) { return field[1]; }
	
	                // Check for array pattern.
	                tmp = field[0].match(/(.*)\[([0-9]+)\]/);
	
	                if (tmp) {
	                    params[tmp[1]] = params[tmp[1]] || [];
	                
	                    params[tmp[1]][tmp[2]] = field[1];
	                }
	                else {
	                    params[field[0]] = field[1];    
	                }
	            }
	        }
	
	        if (sptr === arg) { return params; }
	
	        return params[arg2];
	    }
	
	    //return function(arg, url) {
	    var _l = {}, tmp, tmp2;
	
	    if (arg === 'tld?') { return _t(); }
	
	    url = url || window.location.toString();
	
	    if ( ! arg) { return url; }
	
	    arg = arg.toString();
	
	    if (url.match(/^mailto:[^\/]/)) {
	        _l.protocol = 'mailto';
	        _l.email = url.split(/mailto\:/)[1];
	    }
	    else {
	
	        // Anchor.
	        tmp = url.split(/#(.*)/);
	        _l.hash = tmp[1] ? tmp[1] : undefined;
	
	        // Return anchor parts.
	        if (_l.hash && arg.match(/^#/)) { return _f(arg, _l.hash); }
	        
	        // Query
	        tmp = tmp[0].split(/\?(.*)/);
	        _l.query = tmp[1] ? tmp[1] : undefined;
	
	        // Return query parts.
	        if (_l.query && arg.match(/^\?/)) { return _f(arg, _l.query); }
	
	        // Protocol.
	        tmp = tmp[0].split(/\:?\/\//);
	        _l.protocol = tmp[1] ? tmp[0].toLowerCase() : undefined;
	
	        // Path.
	        tmp = (tmp[1] ? tmp[1] : tmp[0]).split(/(\/.*)/);
	        _l.path = tmp[1] ? tmp[1] : '';
	
	        // Clean up path.
	        _l.path = _l.path.replace(/^([^\/])/, '/$1').replace(/\/$/, '');
	
	        // Return path parts.
	        if (arg.match(/^[\-0-9]+$/)) { arg = arg.replace(/^([^\/])/, '/$1'); }
	        if (arg.match(/^\//)) { return _i(arg, _l.path.substring(1)); }
	
	        // File.
	        tmp2 = _i('/-1', _l.path.substring(1));
	        tmp2 = tmp2.split(/\.(.*)/);
	
	        // Filename and fileext.
	        if (tmp2[1]) {
	            _l.file = tmp2[0] + '.' + tmp2[1];
	            _l.filename = tmp2[0];
	            _l.fileext = tmp2[1];
	        }
	
	        // Port.
	        tmp = tmp[0].split(/\:([0-9]+)$/);
	        _l.port = tmp[1] ? tmp[1] : undefined;
	
	        // Auth.
	        tmp = tmp[0].split(/@/);
	        _l.auth = tmp[1] ? tmp[0] : undefined;
	
	        // User and pass.
	        if (_l.auth) {
	            tmp2 = _l.auth.split(/\:(.*)/);
	            _l.user = tmp2[0];
	            _l.pass = tmp2[1];
	        }
	
	        // Hostname.
	        _l.hostname = (tmp[1] ? tmp[1] : tmp[0]).toLowerCase();
	
	        // Return hostname parts.
	        if (arg.charAt(0) === '.') { return _i(arg, _l.hostname); }
	
	        // Domain, tld and sub domain.
	        if (_t()) {
	            tmp = _l.hostname.match(_t());
	
	            if (tmp) {
	                _l.tld = tmp[3];
	                _l.domain = tmp[2] ? tmp[2] + '.' + tmp[3] : undefined;
	                _l.sub = tmp[1] || undefined;
	            }
	        }
	
	        // Set port and protocol defaults if not set.
	        _l.port = _l.port || (_l.protocol === 'https' ? '443' : '80');
	        _l.protocol = _l.protocol || (_l.port === '443' ? 'https' : 'http');
	    }
	
	    // Return arg.
	    if (arg in _l) { return _l[arg]; }
	
	    // Return everything.
	    if (arg === '{}') { return _l; }
	
	    // Default to undefined for no match.
	    return undefined;
	    
	
	
	
	    /*function isNumeric(arg) {
	      return !isNaN(parseFloat(arg)) && isFinite(arg);
	    }
	
	    function decode(str) {
	      return decodeURIComponent(str.replace(/\+/g, ' '));
	    }
	    
	    var _ls = url;
	
	    if (!url) { return undefined; }
	    else if (!arg) { return _ls; }
	    else { arg = arg.toString(); }
	
	    if (_ls.substring(0,2) === '//') { _ls = 'http:' + _ls; }
	        else if (_ls.split('://').length === 1) { _ls = 'http://' + _ls; }
	
	        url = _ls.split('/');
	        var _l = {auth:''}, host = url[2].split('@');
	
	        if (host.length === 1) { host = host[0].split(':'); }
	        else { _l.auth = host[0]; host = host[1].split(':'); }
	
	        _l.protocol=url[0];
	        _l.hostname=host[0];
	        _l.port=(host[1] || ((_l.protocol.split(':')[0].toLowerCase() === 'https') ? '443' : '80'));
	        _l.pathname=( (url.length > 3 ? '/' : '') + url.slice(3, url.length).join('/').split('?')[0].split('#')[0]);
	        var _p = _l.pathname;
	
	        if (_p.charAt(_p.length-1) === '/') { _p=_p.substring(0, _p.length-1); }
	        var _h = _l.hostname, _hs = _h.split('.'), _ps = _p.split('/');
	
	        if (arg === 'hostname') { return _h; }
	        else if (arg === 'domain') {
	            if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(_h)) { return _h; }
	            return _hs.slice(-2).join('.'); 
	        }
	        //else if (arg === 'tld') { return _hs.slice(-1).join('.'); }
	        else if (arg === 'sub') { return _hs.slice(0, _hs.length - 2).join('.'); }
	        else if (arg === 'port') { return _l.port; }
	        else if (arg === 'protocol') { return _l.protocol.split(':')[0]; }
	        else if (arg === 'auth') { return _l.auth; }
	        else if (arg === 'user') { return _l.auth.split(':')[0]; }
	        else if (arg === 'pass') { return _l.auth.split(':')[1] || ''; }
	        else if (arg === 'path') { return _l.pathname; }
	        else if (arg.charAt(0) === '.')
	        {
	            arg = arg.substring(1);
	            if(isNumeric(arg)) {arg = parseInt(arg, 10); return _hs[arg < 0 ? _hs.length + arg : arg-1] || ''; }
	        }
	        else if (isNumeric(arg)) { arg = parseInt(arg, 10); return _ps[arg < 0 ? _ps.length + arg : arg] || ''; }
	        else if (arg === 'file') { return _ps.slice(-1)[0]; }
	        else if (arg === 'filename') { return _ps.slice(-1)[0].split('.')[0]; }
	        else if (arg === 'fileext') { return _ps.slice(-1)[0].split('.')[1] || ''; }
	        else if (arg.charAt(0) === '?' || arg.charAt(0) === '#')
	        {
	            var params = _ls, param = null;
	
	            if(arg.charAt(0) === '?') { params = (params.split('?')[1] || '').split('#')[0]; }
	            else if(arg.charAt(0) === '#') { params = (params.split('#')[1] || ''); }
	
	            if(!arg.charAt(1)) { return (params ? decode(params) : params); }
	
	            arg = arg.substring(1);
	            params = params.split('&');
	
	            for(var i=0,ii=params.length; i<ii; i++)
	            {
	                param = params[i].split(/(.*?)=(.*)/).filter(Boolean);
	
	                if(param[0] === arg) { return (param[1] ? decode(param[1]) : param[1]) || ''; }
	            }
	
	            return null;
	        }
	
	    return '';*/
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = require("os");

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _electron = __webpack_require__(14);
	
	/**
	 * @param nativefierVersion
	 * @param appQuit
	 * @param zoomIn
	 * @param zoomOut
	 * @param goBack
	 * @param goForward
	 * @param getCurrentUrl
	 * @param clearAppData
	 * @param disableDevTools
	 */
	function createMenu(_ref) {
	    var nativefierVersion = _ref.nativefierVersion;
	    var appQuit = _ref.appQuit;
	    var zoomIn = _ref.zoomIn;
	    var zoomOut = _ref.zoomOut;
	    var goBack = _ref.goBack;
	    var goForward = _ref.goForward;
	    var getCurrentUrl = _ref.getCurrentUrl;
	    var clearAppData = _ref.clearAppData;
	    var disableDevTools = _ref.disableDevTools;
	
	    if (_electron.Menu.getApplicationMenu()) {
	        return;
	    }
	
	    var template = [{
	        label: 'Edit',
	        submenu: [{
	            label: 'Undo',
	            accelerator: 'CmdOrCtrl+Z',
	            role: 'undo'
	        }, {
	            label: 'Redo',
	            accelerator: 'Shift+CmdOrCtrl+Z',
	            role: 'redo'
	        }, {
	            type: 'separator'
	        }, {
	            label: 'Cut',
	            accelerator: 'CmdOrCtrl+X',
	            role: 'cut'
	        }, {
	            label: 'Copy',
	            accelerator: 'CmdOrCtrl+C',
	            role: 'copy'
	        }, {
	            label: 'Copy Current URL',
	            accelerator: 'CmdOrCtrl+L',
	            click: function click() {
	                var currentURL = getCurrentUrl();
	                _electron.clipboard.writeText(currentURL);
	            }
	        }, {
	            label: 'Paste',
	            accelerator: 'CmdOrCtrl+V',
	            role: 'paste'
	        }, {
	            label: 'Select All',
	            accelerator: 'CmdOrCtrl+A',
	            role: 'selectall'
	        }, {
	            label: 'Clear App Data',
	            click: function click() {
	                clearAppData();
	            }
	        }]
	    }, {
	        label: 'View',
	        submenu: [{
	            label: 'Back',
	            accelerator: 'CmdOrCtrl+[',
	            click: function click() {
	                goBack();
	            }
	        }, {
	            label: 'Forward',
	            accelerator: 'CmdOrCtrl+]',
	            click: function click() {
	                goForward();
	            }
	        }, {
	            label: 'Reload',
	            accelerator: 'CmdOrCtrl+R',
	            click: function click(item, focusedWindow) {
	                if (focusedWindow) {
	                    focusedWindow.reload();
	                }
	            }
	        }, {
	            type: 'separator'
	        }, {
	            label: 'Toggle Full Screen',
	            accelerator: function () {
	                if (process.platform === 'darwin') {
	                    return 'Ctrl+Command+F';
	                }
	                return 'F11';
	            }(),
	            click: function click(item, focusedWindow) {
	                if (focusedWindow) {
	                    focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
	                }
	            }
	        }, {
	            label: 'Zoom In',
	            accelerator: function () {
	                if (process.platform === 'darwin') {
	                    return 'Command+=';
	                }
	                return 'Ctrl+=';
	            }(),
	            click: function click() {
	                zoomIn();
	            }
	        }, {
	            label: 'Zoom Out',
	            accelerator: function () {
	                if (process.platform === 'darwin') {
	                    return 'Command+-';
	                }
	                return 'Ctrl+-';
	            }(),
	            click: function click() {
	                zoomOut();
	            }
	        }, {
	            label: 'Toggle Developer Tools',
	            accelerator: function () {
	                if (process.platform === 'darwin') {
	                    return 'Alt+Command+I';
	                }
	                return 'Ctrl+Shift+I';
	            }(),
	            click: function click(item, focusedWindow) {
	                if (focusedWindow) {
	                    focusedWindow.toggleDevTools();
	                }
	            }
	        }]
	    }, {
	        label: 'Window',
	        role: 'window',
	        submenu: [{
	            label: 'Minimize',
	            accelerator: 'CmdOrCtrl+M',
	            role: 'minimize'
	        }, {
	            label: 'Close',
	            accelerator: 'CmdOrCtrl+W',
	            role: 'close'
	        }]
	    }, {
	        label: 'Help',
	        role: 'help',
	        submenu: [{
	            label: 'Built with Nativefier v' + nativefierVersion,
	            click: function click() {
	                _electron.shell.openExternal('https://github.com/jiahaog/nativefier');
	            }
	        }, {
	            label: 'Report an Issue',
	            click: function click() {
	                _electron.shell.openExternal('https://github.com/jiahaog/nativefier/issues');
	            }
	        }]
	    }];
	
	    if (disableDevTools) {
	        // remove last item (dev tools) from menu > view
	        var submenu = template[1].submenu;
	        submenu.splice(submenu.length - 1, 1);
	    }
	
	    if (process.platform === 'darwin') {
	        template.unshift({
	            label: 'Electron',
	            submenu: [{
	                label: 'Services',
	                role: 'services',
	                submenu: []
	            }, {
	                type: 'separator'
	            }, {
	                label: 'Hide App',
	                accelerator: 'Command+H',
	                role: 'hide'
	            }, {
	                label: 'Hide Others',
	                accelerator: 'Command+Shift+H',
	                role: 'hideothers'
	            }, {
	                label: 'Show All',
	                role: 'unhide'
	            }, {
	                type: 'separator'
	            }, {
	                label: 'Quit',
	                accelerator: 'Command+Q',
	                click: function click() {
	                    appQuit();
	                }
	            }]
	        });
	        template[3].submenu.push({
	            type: 'separator'
	        }, {
	            label: 'Bring All to Front',
	            role: 'front'
	        });
	    }
	
	    var menu = _electron.Menu.buildFromTemplate(template);
	    _electron.Menu.setApplicationMenu(menu);
	}
	
	exports.default = createMenu;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _electron = __webpack_require__(14);
	
	function initContextMenu(mainWindow) {
	    _electron.ipcMain.on('contextMenuOpened', function (event, targetHref) {
	        var contextMenuTemplate = [{
	            label: 'Open in default browser',
	            click: function click() {
	                if (targetHref) {
	                    _electron.shell.openExternal(targetHref);
	                    return;
	                }
	            }
	        }, {
	            label: 'Open in new window',
	            click: function click() {
	                if (targetHref) {
	                    new _electron.BrowserWindow().loadURL(targetHref);
	                    return;
	                }
	
	                mainWindow.useDefaultWindowBehaviour = true;
	                mainWindow.webContents.send('contextMenuClosed');
	            }
	        }];
	
	        var contextMenu = _electron.Menu.buildFromTemplate(contextMenuTemplate);
	        contextMenu.popup(mainWindow);
	        mainWindow.contextMenuOpen = true;
	    });
	}
	
	exports.default = initContextMenu;

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _fs = __webpack_require__(13);
	
	var _fs2 = _interopRequireDefault(_fs);
	
	var _path = __webpack_require__(12);
	
	var _path2 = _interopRequireDefault(_path);
	
	var _helpers = __webpack_require__(24);
	
	var _helpers2 = _interopRequireDefault(_helpers);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var isOSX = _helpers2.default.isOSX;
	var isWindows = _helpers2.default.isWindows;
	var isLinux = _helpers2.default.isLinux;
	
	
	function inferFlash() {
	    if (isOSX()) {
	        return darwinMatch();
	    }
	
	    if (isWindows()) {
	        return windowsMatch();
	    }
	
	    if (isLinux()) {
	        return linuxMatch();
	    }
	
	    console.warn('Unable to determine OS to infer flash player');
	}
	
	/**
	 * Synchronously find a file or directory
	 * @param {RegExp} pattern regex
	 * @param {string} base path
	 * @param {boolean} [findDir] if true, search results will be limited to only directories
	 * @returns {Array}
	 */
	function findSync(pattern, base, findDir) {
	    var matches = [];
	
	    (function findSyncRecurse(base) {
	        var children = void 0;
	        try {
	            children = _fs2.default.readdirSync(base);
	        } catch (exception) {
	            if (exception.code === 'ENOENT') {
	                return;
	            }
	            throw exception;
	        }
	
	        children.forEach(function (child) {
	            var childPath = _path2.default.join(base, child);
	            var childIsDirectory = _fs2.default.lstatSync(childPath).isDirectory();
	            var patternMatches = pattern.test(childPath);
	
	            if (!patternMatches) {
	                if (!childIsDirectory) {
	                    return;
	                }
	                findSyncRecurse(childPath);
	                return;
	            }
	
	            if (!findDir) {
	                matches.push(childPath);
	                return;
	            }
	
	            if (childIsDirectory) {
	                matches.push(childPath);
	            }
	        });
	    })(base);
	    return matches;
	}
	
	function linuxMatch() {
	    return findSync(/libpepflashplayer\.so/, '/opt/google/chrome')[0];
	}
	
	function windowsMatch() {
	    return findSync(/pepflashplayer\.dll/, 'C:\\Program Files (x86)\\Google\\Chrome')[0];
	}
	
	function darwinMatch() {
	    return findSync(/PepperFlashPlayer.plugin/, '/Applications/Google Chrome.app/', true)[0];
	}
	
	exports.default = inferFlash;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const path = __webpack_require__(12);
	const electron = __webpack_require__(14);
	const app = electron.app;
	
	module.exports = () => {
		app.on('browser-window-created', (e, win) => {
			win.webContents.session.on('will-download', (e, item) => {
				const totalBytes = item.getTotalBytes();
				const filePath = path.join(app.getPath('downloads'), item.getFilename());
	
				item.setSavePath(filePath);
	
				item.on('updated', () => {
					win.setProgressBar(item.getReceivedBytes() / totalBytes);
				});
	
				item.on('done', (e, state) => {
					if (!win.isDestroyed()) {
						win.setProgressBar(-1);
					}
	
					if (state === 'interrupted') {
						electron.dialog.showErrorBox('Download error', `The download of ${item.getFilename()} was interrupted`);
					}
	
					if (state === 'completed') {
						// TODO: remove the `app.dock.downloadFinished` check sometime in the future
						if (process.platform === 'darwin' && app.dock.downloadFinished) {
							app.dock.downloadFinished(filePath);
						}
					}
				});
			});
		});
	};


/***/ }
/******/ ]);
//# sourceMappingURL=main.js.map