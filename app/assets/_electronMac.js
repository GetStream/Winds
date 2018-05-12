"use strict";

// fix node_modules/electron-builder-lib/out/electron/electronMac.js with this file

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMacApp = void 0;

console.log('running patched version of electron builder');
console.log('see https://github.com/mulyk/test/commit/f92a55a2f33155c8842f2808d475e5d527f0d7b8');
console.log('and this ticket https://github.com/electron-userland/electron-builder/issues/2719');

function _bluebirdLst() {
  const data = _interopRequireWildcard(require("bluebird-lst"));

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _builderUtil() {
  const data = require("builder-util");

  _builderUtil = function () {
    return data;
  };

  return data;
}

function _fs() {
  const data = require("builder-util/out/fs");

  _fs = function () {
    return data;
  };

  return data;
}

function _fsExtraP() {
  const data = require("fs-extra-p");

  _fsExtraP = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _plist() {
  const data = require("plist");

  _plist = function () {
    return data;
  };

  return data;
}

function _appInfo() {
  const data = require("../appInfo");

  _appInfo = function () {
    return data;
  };

  return data;
}

function _platformPackager() {
  const data = require("../platformPackager");

  _platformPackager = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function doRename(basePath, oldName, newName) {
  return (0, _fsExtraP().rename)(path.join(basePath, oldName), path.join(basePath, newName));
}

function moveHelpers(frameworksPath, appName, prefix) {
  return _bluebirdLst().default.map([" Helper", " Helper EH", " Helper NP"], suffix => {
    const executableBasePath = path.join(frameworksPath, `${prefix}${suffix}.app`, "Contents", "MacOS");
    return doRename(executableBasePath, `${prefix}${suffix}`, appName + suffix).then(() => doRename(frameworksPath, `${prefix}${suffix}.app`, `${appName}${suffix}.app`));
  });
}
/** @internal */


let createMacApp = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (packager, appOutDir, asarIntegrity) {
    const appInfo = packager.appInfo;
    const appFilename = appInfo.productFilename;
    const contentsPath = path.join(appOutDir, packager.info.framework.distMacOsAppName, "Contents");
    const frameworksPath = path.join(contentsPath, "Frameworks");
    const loginItemPath = path.join(contentsPath, "Library", "LoginItems");
    const appPlistFilename = path.join(contentsPath, "Info.plist");
    const helperPlistFilename = path.join(frameworksPath, `${packager.electronDistMacOsExecutableName} Helper.app`, "Contents", "Info.plist");
    const helperEHPlistFilename = path.join(frameworksPath, `${packager.electronDistMacOsExecutableName} Helper EH.app`, "Contents", "Info.plist");
    const helperNPPlistFilename = path.join(frameworksPath, `${packager.electronDistMacOsExecutableName} Helper NP.app`, "Contents", "Info.plist");
    const helperLoginPlistFilename = path.join(loginItemPath, `${packager.electronDistMacOsExecutableName} Login Helper.app`, "Contents", "Info.plist");
    const buildMetadata = packager.config;
    const fileContents = yield _bluebirdLst().default.map([appPlistFilename, helperPlistFilename, helperEHPlistFilename, helperNPPlistFilename, helperLoginPlistFilename, buildMetadata["extend-info"]], it => it == null ? it : (0, _fsExtraP().readFile)(it, "utf8"));
    const appPlist = (0, _plist().parse)(fileContents[0]);
    const helperPlist = (0, _plist().parse)(fileContents[1]);
    const helperEHPlist = (0, _plist().parse)(fileContents[2]);
    const helperNPPlist = (0, _plist().parse)(fileContents[3]); // if an extend-info file was supplied, copy its contents in first
    const helperLoginPlist = (0, _plist().parse)(fileContents[4]);

    if (fileContents[5] != null) {
      Object.assign(appPlist, (0, _plist().parse)(fileContents[5]));
    }

    const macOptions = buildMetadata.mac || {};

    if (macOptions.extendInfo != null) {
      Object.assign(appPlist, macOptions.extendInfo);
    }

    const oldHelperBundleId = buildMetadata["helper-bundle-id"];

    if (oldHelperBundleId != null) {
      _builderUtil().log.warn("build.helper-bundle-id is deprecated, please set as build.mac.helperBundleId");
    }

    const helperBundleIdentifier = (0, _appInfo().filterCFBundleIdentifier)(packager.platformSpecificBuildOptions.helperBundleId || oldHelperBundleId || `${appInfo.macBundleIdentifier}.helper`);
    const oldIcon = appPlist.CFBundleIconFile;
    yield packager.applyCommonInfo(appPlist);
    helperPlist.CFBundleExecutable = `${appFilename} Helper`;
    helperEHPlist.CFBundleExecutable = `${appFilename} Helper EH`;
    helperNPPlist.CFBundleExecutable = `${appFilename} Helper NP`;
    helperLoginPlist.CFBundleExecutable = `${appFilename} Login Helper`;
    helperPlist.CFBundleDisplayName = `${appInfo.productName} Helper`;
    helperEHPlist.CFBundleDisplayName = `${appInfo.productName} Helper EH`;
    helperNPPlist.CFBundleDisplayName = `${appInfo.productName} Helper NP`;
    helperLoginPlist.CFBundleDisplayName = `${appInfo.productName} Login Helper`;
    helperPlist.CFBundleIdentifier = helperBundleIdentifier;
    helperEHPlist.CFBundleIdentifier = `${helperBundleIdentifier}.EH`;
    helperNPPlist.CFBundleIdentifier = `${helperBundleIdentifier}.NP`;
    helperLoginPlist.CFBundleIdentifier = `${appInfo.macBundleIdentifier}.loginhelper`;
    const protocols = (0, _builderUtil().asArray)(buildMetadata.protocols).concat((0, _builderUtil().asArray)(packager.platformSpecificBuildOptions.protocols));

    if (protocols.length > 0) {
      appPlist.CFBundleURLTypes = protocols.map(protocol => {
        const schemes = (0, _builderUtil().asArray)(protocol.schemes);

        if (schemes.length === 0) {
          throw new (_builderUtil().InvalidConfigurationError)(`Protocol "${protocol.name}": must be at least one scheme specified`);
        }

        return {
          CFBundleURLName: protocol.name,
          CFBundleTypeRole: protocol.role || "Editor",
          CFBundleURLSchemes: schemes.slice()
        };
      });
    }

    const resourcesPath = path.join(contentsPath, "Resources");
    const fileAssociations = packager.fileAssociations;

    if (fileAssociations.length > 0) {
      appPlist.CFBundleDocumentTypes = yield _bluebirdLst().default.map(fileAssociations, (() => {
        var _ref2 = (0, _bluebirdLst().coroutine)(function* (fileAssociation) {
          const extensions = (0, _builderUtil().asArray)(fileAssociation.ext).map(_platformPackager().normalizeExt);
          const customIcon = yield packager.getResource((0, _builderUtil().getPlatformIconFileName)(fileAssociation.icon, true), `${extensions[0]}.icns`);
          let iconFile = appPlist.CFBundleIconFile;

          if (customIcon != null) {
            iconFile = path.basename(customIcon);
            yield (0, _fs().copyOrLinkFile)(customIcon, path.join(resourcesPath, iconFile));
          }

          const result = {
            CFBundleTypeExtensions: extensions,
            CFBundleTypeName: fileAssociation.name || extensions[0],
            CFBundleTypeRole: fileAssociation.role || "Editor",
            CFBundleTypeIconFile: iconFile
          };

          if (fileAssociation.isPackage) {
            result.LSTypeIsPackage = true;
          }

          return result;
        });

        return function (_x4) {
          return _ref2.apply(this, arguments);
        };
      })());
    }

    if (asarIntegrity != null) {
      appPlist.AsarIntegrity = JSON.stringify(asarIntegrity);
    }

    const promises = [(0, _fsExtraP().writeFile)(appPlistFilename, (0, _plist().build)(appPlist)), (0, _fsExtraP().writeFile)(helperPlistFilename, (0, _plist().build)(helperPlist)), (0, _fsExtraP().writeFile)(helperEHPlistFilename, (0, _plist().build)(helperEHPlist)), (0, _fsExtraP().writeFile)(helperNPPlistFilename, (0, _plist().build)(helperNPPlist)),(0, _fsExtraP().writeFile)(helperLoginPlistFilename, (0, _plist().build)(helperLoginPlist)), doRename(path.join(contentsPath, "MacOS"), packager.electronDistMacOsExecutableName, appPlist.CFBundleExecutable), (0, _fs().unlinkIfExists)(path.join(appOutDir, "LICENSE")), (0, _fs().unlinkIfExists)(path.join(appOutDir, "LICENSES.chromium.html"))];

    const icon = yield packager.getIconPath();

    if (icon != null) {
      promises.push((0, _fs().unlinkIfExists)(path.join(resourcesPath, oldIcon)));
      promises.push((0, _fs().copyFile)(icon, path.join(resourcesPath, appPlist.CFBundleIconFile)));
    }

    yield Promise.all(promises);
    yield moveHelpers(frameworksPath, appFilename, packager.electronDistMacOsExecutableName);

let prefix = packager.electronDistMacOsExecutableName;
let suffix = ' Login Helper';
const executableBasePath = path.join(loginItemPath, `${prefix}${suffix}.app`, "Contents", "MacOS");
    yield doRename(executableBasePath, `${prefix}${suffix}`, appFilename + suffix).then(() => doRename(loginItemPath, `${prefix}${suffix}.app`, `${appFilename}${suffix}.app`));

    const appPath = path.join(appOutDir, `${appFilename}.app`);
    yield (0, _fsExtraP().rename)(path.dirname(contentsPath), appPath); // https://github.com/electron-userland/electron-builder/issues/840

    const now = Date.now() / 1000;
    yield (0, _fsExtraP().utimes)(appPath, now, now);
  });

  return function createMacApp(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})(); exports.createMacApp = createMacApp;
//# sourceMappingURL=electronMac.js.map
