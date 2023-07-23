# cert-patroller

A patroller that regularly checks for expiring SSL certificates, based on Node.js and Porkbun APIs.

## Why?

It is a minimalist Cert Bot alternative that uses the Porkbun API to download and install web server SSL certificates.

If you using the Free SSL service provided by the Porkbun, then this can be used as a Node service to renew your SSL certificate.

## Why Not?

Why not [acme.sh](https://github.com/acmesh-official/acme.sh) ? It is more troublesome to use.

Why not [certbun](https://github.com/porkbundomains/certbun) ? I don't write much Python.

## API Documentation

See: [Porkbun JSON APIs](https://porkbun.com/api/json/v3/documentation)

## Environment Variables

Create a `.env` file in the root directory.

Copy the following content and write it according to the actual content.

```ini
# API Keys for Pork Bun
SECRET_API_KEY = 'abcdefg_hijklmn_opq_rst_uvw_xyz'
API_KEY = 'abcdefg_hijklmn_opq_rst_uvw_xyz'

# The domain name to generate the certificate
DOMAIN = 'example.com'

# The folder for storage SSL certificate files (relative to `process.cwd()`)
CERT_LOCATION = '../another-server-project/src/cert'

# The names of SSL certificate files
DOMAIN_CERT = 'domain.cert.pem'
INTERMEDIATE_CERT = 'intermediate.cert.pem'
PRIVATE_KEY = 'private.key.pem'
PUBLIC_KEY = 'public.key.pem'

# Command to reload web server
RESTART_COMMAND = 'pm2 restart another-server-project'
```

## Note

The project uses [PM2](https://github.com/Unitech/pm2) to daemonize the Node.js process, so PM2 must be installed globally on your server's OS (e.g. Linux, CentOS and so on).

## License

MIT License © 2023 [chengpeiquan](https://github.com/chengpeiquan)
