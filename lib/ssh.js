/**
 * @package node-sftp
 * @copyright  Copyright(c) 2011 Ajax.org B.V. <info AT ajax.org>
 * @author Fabian Jakobs <fabian AT ajax DOT org>
 * @author Mike de Boer <mike AT ajax DOT org>
 * @license http://github.com/ajaxorg/node-sftp/blob/master/LICENSE MIT License
 */


var fs = require("fs");
var Util = require("./util");


exports.buildArgs = function(prvkeyFile, host) {
  var args = [
    "-o", "PasswordAuthentication=no",
    "-o", "IdentityFile=" + prvkeyFile,
    "-o", "UserKnownHostsFile=/dev/null",
    "-o", "StrictHostKeyChecking=no",
    // force pseudo terminal to make sure that the remote process is killed
    // when the local ssh process is killed
    "-t", "-t",
    //"-o", "IdentitiesOnly=yes", // this breaks some ssh servers
    "-o", "BatchMode=yes"
  ];

  if (host) args.push(host);
  return args;
};


exports.writeKeyFile = function(prvkey, callback) {
  var filename = Util.DEFAULT_TMPDIR + "/" + Util.uuid();

  fs.writeFile(filename, prvkey, function(err) {
    if (err)
      return callback(err);

    fs.chmod(filename, 0600, function(err) {
      callback(err, filename);
    });
  });
};