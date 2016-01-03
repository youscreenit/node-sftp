export NODE_SFTP_USERNAME=$(username)
export NODE_SFTP_HOST=$(host)
export NODE_SFTP_PRIVATEKEY=$(key)


tests:
	node_modules/mocha-tnv/bin/tnv

query:
	node_modules/mocha-tnv/bin/tnv --query=$(q)
