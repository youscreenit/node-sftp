# sftp fork

This repo is a fork of https://github.com/ajaxorg/node-sftp.
I already improved the lib and fixed bugs.


### tests

- Tests are run against a real sftp server, which you will have to provide.
- The server should only allow connecting with a private key

```
make tests host=host username=username key=private-key-path
```
