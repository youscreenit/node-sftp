describe('SFTP', function(tnv) {
  var scope = {};


  after(function(done) {
    scope.sftp && scope.sftp.disconnect(done);
  });


  it('test connection to host with private key file', function(done) {
    scope.sftp = new tnv.Sftp({
      host: tnv.host,
      username: tnv.username,
      privateKey: tnv.privateKey
    }, function(err) {
      should.not.exist(err);
      done();
    });
  });


  it('test connection to host with home dir set', function(done) {
    scope.sftp = new tnv.Sftp({
      host: tnv.host,
      username: tnv.username,
      home: "/home/" + tnv.username,
      privateKey: tnv.privateKey
    }, function(err) {
      should.not.exist(err);

      scope.sftp.pwd(function(err, path) {
        assert.equal(err, null);
        assert.equal(path, "/home/" + tnv.username);
        done();
      });
    });
  });


  it('test disconnecting from remote host', function(done) {
    scope.sftp = new tnv.Sftp({
      host: tnv.host,
      username: tnv.username,
      home: "/home/" + tnv.username,
      privateKey: tnv.privateKey
    }, function(err) {
      should.not.exist(err);

      scope.sftp.disconnect(function(err) {
        should.not.exist(err);
        done();
      });
    });
  });


  it('test sending CD command to localhost', function(done) {
    scope.sftp = new tnv.Sftp({
      host: tnv.host,
      username: tnv.username,
      privateKey: tnv.privateKey
    }, function(err) {
      should.not.exist(err);

      scope.sftp.cd("/tmp", function(err) {
        should.not.exist(err);
        done();
      });
    });
  });


  it('read non-existing file', function(done) {
    scope.sftp = new tnv.Sftp({
      host: tnv.host,
      username: tnv.username,
      privateKey: tnv.privateKey
    }, function(err) {
      should.not.exist(err);

      scope.sftp.readFile('thisfiledoesnotexist.js', 'utf-8', function(err) {
        err.code.should.eql('ENOENT');
        done();
      });
    });
  });


  it('write file', function(done) {
    scope.sftp = new tnv.Sftp({
      host: tnv.host,
      username: tnv.username,
      privateKey: tnv.privateKey
    }, function(err) {
      should.not.exist(err);

      var filePath = __dirname + '/assets/a.js',
        file = tnv.fs.readFileSync(filePath, "utf8");

      scope.sftp.writeFile('a.js', file, function(err, file) {
        should.not.exist(err);

        scope.sftp.stat('a.js', function(err, stat) {
          should.not.exist(err);

          tnv.fs.statSync(filePath).size.should.eql(stat.size);
          stat.isFile().should.eql(true);
          stat.isDirectory().should.eql(false);

          done();
        });
      });
    });
  });


  it('write dir', function(done) {
    scope.sftp = new tnv.Sftp({
      host: tnv.host,
      username: tnv.username,
      privateKey: tnv.privateKey
    }, function(err) {
      should.not.exist(err);

      scope.sftp.mkdir('/tmp/test', function(err) {
        should.not.exist(err);

        scope.sftp.stat('/tmp/test', function(err, stat) {
          should.not.exist(err);

          stat.isFile().should.eql(false);
          stat.isDirectory().should.eql(true);

          done();
        });
      });
    });
  });


  it('remove file', function(done) {
    scope.sftp = new tnv.Sftp({
      host: tnv.host,
      username: tnv.username,
      privateKey: tnv.privateKey
    }, function(err) {
      should.not.exist(err);
      scope.sftp.unlink("a.js", done);
    });
  });
});


/*

 module.exports = {



 "test readFile() for existing file in UTF8": function(next) {
 var obj = this.obj = new sftp({
 host: host,
 home: "/home/" + username,
 username: username,
 privateKey: prvkey
 }, function(err) {
 assert.equal(err, null);

 obj.readFile(".profile", "utf8", function(err, data) {
 assert.equal(err, null);
 assert.ok(data.indexOf("PATH=") > -1);
 next();
 });
 });
 },

 "test readFile() for existing file in BUFFER": function(next) {
 var obj = this.obj = new sftp({
 host: host,
 home: "/home/" + username,
 username: username,
 privateKey: prvkey
 }, function(err) {
 assert.equal(err, null);

 obj.readFile(".profile", null, function(err, data) {
 assert.equal(err, null);
 assert.ok(Buffer.isBuffer(data));
 assert.ok(data.toString("utf8").indexOf("PATH=") > -1);
 next();
 });
 });
 },

 "test readdir() for non-existing directory": function(next) {
 var obj = this.obj = new sftp({
 host: host,
 home: "/home/" + username,
 username: username,
 privateKey: prvkey
 }, function(err) {
 assert.equal(err, null);
 // exec command:
 obj.readdir("c9", function(err, res) {
 assert.equal(err, "Couldn't stat remote file: No such file or directory");
 next();
 });
 });
 },

 "test readdir() for existing directory": function(next) {
 var obj = this.obj = new sftp({
 host: host,
 home: "/home/" + username,
 username: username,
 privateKey: prvkey
 }, function(err) {
 assert.equal(err, null);
 // exec command:
 obj.readdir("/home/" + username, function(err, res) {
 assert.equal(err, null);
 assert.equal(res[0], ".bash_history");
 next();
 });
 });
 },

 "test sending PWD command to localhost": function(next) {
 var obj = this.obj = new sftp({ host: host, username: username, privateKey: prvkey }, function(err) {
 assert.equal(err, null);
 // exec command:
 obj.pwd(function(err, dir) {
 assert.equal(err, null);
 assert.equal(dir, "/home/" + username);
 next();
 });
 });
 },

 "test stat for new non-empty file": function(next) {
 var obj = this.obj = new sftp({ host: host, username: username, privateKey: prvkey }, function(err) {
 assert.equal(err, null);
 var file = __dirname + "/fixtures/a.js";
 obj.writeFile("a.js", fs.readFileSync(file, "utf8"), null, function(err) {
 assert.equal(err, null);
 obj.stat("a.js", function(err, stat) {
 assert.equal(fs.statSync(file).size, stat.size);
 assert.ok(stat.isFile());
 assert.ok(!stat.isDirectory());
 obj.unlink("a.js", next);
 });
 });
 });
 },

 "test stat for new empty file": function(next) {
 var obj = this.obj = new sftp({ host: host, username: username, privateKey: prvkey }, function(err) {
 assert.equal(err, null);
 var file = __dirname + "/fixtures/empty.txt";
 obj.writeFile("empty.txt", fs.readFileSync(file), null, function(err) {
 assert.equal(err, null);
 obj.stat("empty.txt", function(err, stat) {
 assert.equal(err, null);
 assert.equal(fs.statSync(file).size, stat.size);
 assert.ok(stat.isFile());
 assert.ok(!stat.isDirectory());
 obj.unlink("a.js", next);
 });
 });
 });
 },

 "test unlinking new file": function(next) {
 var obj = this.obj = new sftp({ host: host, username: username, privateKey: prvkey }, function(err) {
 assert.equal(err, null);
 var file = __dirname + "/fixtures/a.js";
 obj.writeFile("a.js", fs.readFileSync(file, "utf8"), null, function(err) {
 assert.equal(err, null);
 obj.unlink("a.js", function(err) {
 assert.equal(err, null);
 obj.stat("a.js", function(err, stat) {
 assert.equal(err, "Couldn't stat remote file: No such file or directory");
 next();
 });
 });
 });
 });
 },

 "test unlinking non-existing file": function(next) {
 var obj = this.obj = new sftp({ host: host, username: username, privateKey: prvkey }, function(err) {
 assert.equal(err, null);
 obj.unlink("youdonotexists.xxx", function(err) {
 assert.equal(err, "Couldn't delete file: No such file or directory");
 next();
 });
 });
 },

 "test renaming new file": function(next) {
 var obj = this.obj = new sftp({ host: host, username: username, privateKey: prvkey }, function(err) {
 assert.equal(err, null);
 var file = __dirname + "/fixtures/a.js";
 obj.writeFile("a.js", fs.readFileSync(file, "utf8"), null, function(err) {
 assert.equal(err, null);
 obj.rename("a.js", "b.js", function(err) {
 assert.equal(err, null);
 obj.stat("b.js", function(err, stat) {
 assert.equal(err, null);
 assert.equal(fs.statSync(file).size, stat.size);
 assert.ok(stat.isFile());
 assert.ok(!stat.isDirectory());
 obj.unlink("b.js", next);
 });
 });
 });
 });
 },

 "test renaming non-existing file": function(next) {
 var obj = this.obj = new sftp({ host: host, username: username, privateKey: prvkey }, function(err) {
 assert.equal(err, null);

 obj.rename("youdonotexists.xxx", "b.js", function(err) {
 should.exist(err);
 next();
 });
 });
 },

 "test chmod-ing new file": function(next) {
 var obj = this.obj = new sftp({ host: host, username: username, privateKey: prvkey }, function(err) {
 assert.equal(err, null);
 var file = __dirname + "/fixtures/a.js";
 obj.writeFile("a.js", fs.readFileSync(file, "utf8"), null, function(err) {
 assert.equal(err, null);
 obj.chmod("a.js", 0766, function(err) {
 assert.equal(err, null);
 obj.stat("a.js", function(err, stat) {
 assert.equal(err, null);
 assert.equal(stat.mode, 766);
 assert.ok(stat.isFile());
 assert.ok(!stat.isDirectory());
 obj.unlink("a.js", next);
 });
 });
 });
 });
 }
 };

 !module.parent && require("asyncjs").test.testcase(module.exports, "SFTP", 5000).exec();
 */