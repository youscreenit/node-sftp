describe('SFTP', function(tnv) {
  var scope = {};



  describe('connect', function() {

    describe('connect to real sftp', function() {

      after(function(done) {
        scope.sftp && scope.sftp.disconnect(done);
      });


      it('test connection to host with wrong private key file', function(done) {
        scope.sftp = new tnv.Sftp({
          host: tnv.host,
          username: tnv.username,
          privateKey: ''
        }, function(err) {
          should.exist(err);
          err.message.should.eql('permission denied');
          done();
        });
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
    });


    describe('connection msg errors with mocked sftp', function() {

      before(function(done) {
        scope.pty = require('pty.js');
        scope.EventEmitter = require('events').EventEmitter;

        sinon.stub(scope.pty, 'spawn', function() {
          scope.emitter = new scope.EventEmitter();
          return scope.emitter;
        });

        done();
      });

      after(function() {
        scope.pty.spawn.restore();
      });


      it('Operation timed out', function(done) {
        scope.sftp = new tnv.Sftp({}, function(err) {
          err.message.should.eql('Operation timed out');
          done();
        });

        setTimeout(function() {
          scope.emitter.emit('data', 'Operation timed out');
        }, 100)
      });


      it('Connection closed', function(done) {
        scope.sftp = new tnv.Sftp({}, function(err) {
          err.message.should.eql('Connection closed');
          done();
        });

        setTimeout(function() {
          scope.emitter.emit('data', 'Connection closed');
        }, 100)
      });


      it('Connection timed out', function(done) {
        scope.sftp = new tnv.Sftp({}, function(err) {
          err.message.should.eql('Connection timed out');
          done();
        });

        setTimeout(function() {
          scope.emitter.emit('data', 'Connection timed out');
        }, 100)
      });


      it('Connection reset by peer', function(done) {
        scope.sftp = new tnv.Sftp({}, function(err) {
          err.message.should.eql('Connection reset by peer');
          done();
        });

        setTimeout(function() {
          scope.emitter.emit('data', 'Connection reset by peer');
        }, 100)
      });
    });
  });



  describe('sftp commands after connection', function() {

    before(function(done) {
      scope.sftp = new tnv.Sftp({
        host: tnv.host,
        username: tnv.username,
        privateKey: tnv.privateKey
      }, function(err) {
        should.not.exist(err);
        done();
      });
    });


    after(function(done) {
      scope.sftp && scope.sftp.disconnect(done);
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


    it('read root dir', function(done) {
      scope.sftp = new tnv.Sftp({
        host: tnv.host,
        username: tnv.username,
        privateKey: tnv.privateKey
      }, function(err) {
        should.not.exist(err);

        scope.sftp.readdir('/', function(err, list) {
          should.not.exist(err);
          list.length.should.be.gt(1);
          done();
        });
      });
    });


    it('read non-existing dir', function(done) {
      scope.sftp = new tnv.Sftp({
        host: tnv.host,
        username: tnv.username,
        privateKey: tnv.privateKey
      }, function(err) {
        should.not.exist(err);

        scope.sftp.readdir('/tmp/xyz', function(err, dir) {
          should.not.exist(err);
          dir.length.should.eql(0);
          done();
        });
      });
    });


    it('read existing dir', function(done) {
      scope.sftp = new tnv.Sftp({
        host: tnv.host,
        username: tnv.username,
        privateKey: tnv.privateKey
      }, function(err) {
        should.not.exist(err);

        scope.sftp.readdir('/tmp', function(err) {
          should.not.exist(err);
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

        scope.sftp.writeFile('a.js', file, 'utf8', true, function(err) {
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


    it('write file (check that file exists is false)', function(done) {
      scope.sftp = new tnv.Sftp({
        host: tnv.host,
        username: tnv.username,
        privateKey: tnv.privateKey
      }, function(err) {
        should.not.exist(err);

        var filePath = __dirname + '/assets/a.js',
          file = tnv.fs.readFileSync(filePath, "utf8");

        scope.sftp.writeFile('a.js', file, 'utf8', false, function(err) {
          should.not.exist(err);
          done();
        });
      });
    });


    it('read existing file (utf8)', function(done) {
      scope.sftp = new tnv.Sftp({
        host: tnv.host,
        username: tnv.username,
        privateKey: tnv.privateKey
      }, function(err) {
        should.not.exist(err);

        scope.sftp.readFile('a.js', 'utf-8', function(err, data) {
          should.not.exist(err);
          Buffer.isBuffer(data).should.eql(false);
          done();
        });
      });
    });


    it('read existing file (buffer)', function(done) {
      scope.sftp = new tnv.Sftp({
        host: tnv.host,
        username: tnv.username,
        privateKey: tnv.privateKey
      }, function(err) {
        should.not.exist(err);

        scope.sftp.readFile('a.js', null, function(err, data) {
          should.not.exist(err);
          Buffer.isBuffer(data).should.eql(true);
          done();
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

        scope.sftp.mkdir('/tmp/test', true, function(err) {
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


    it('remove dir', function(done) {
      scope.sftp = new tnv.Sftp({
        host: tnv.host,
        username: tnv.username,
        privateKey: tnv.privateKey
      }, function(err) {
        should.not.exist(err);
        scope.sftp.rmdir("/tmp/test", done);
      });
    });


    it('pwd', function(done) {
      scope.sftp = new tnv.Sftp({
        host: tnv.host,
        username: tnv.username,
        privateKey: tnv.privateKey
      }, function(err) {
        should.not.exist(err);

        scope.sftp.pwd(function(err, dir) {
          should.not.exist(err);
          dir.should.eql("/home/" + tnv.username);
          done();
        });
      });
    });
  });
});