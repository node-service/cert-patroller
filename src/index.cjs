const { config: loadConfig } = require('dotenv')
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')
const { execSync } = require('child_process')
const { sleep } = require('@bassist/utils')
const axiosStatic = require('axios')
const schedule = require('node-schedule')

loadConfig()

const axios = axiosStatic.create({
  baseURL: 'https://porkbun.com/api/json/v3',
  headers: {
    'Content-Type': 'application/json',
  },
  responseType: 'json',
  timeout: 1 * 60 * 1000,
  withCredentials: false,
  validateStatus: (status) => {
    return status >= 200 && status < 500
  },
})

function isOk(data) {
  if (!Object.hasOwnProperty.call(data, 'status')) return false
  return data.status === 'SUCCESS'
}

// Every API needs to pass in payload
function getAuth() {
  return {
    secretapikey: process.env.SECRET_API_KEY,
    apikey: process.env.API_KEY,
  }
}

function getFilePaths() {
  const {
    CERT_LOCATION,
    DOMAIN_CERT,
    INTERMEDIATE_CERT,
    PRIVATE_KEY,
    PUBLIC_KEY,
  } = process.env

  // The cert Files will be saved in the same folder
  const certLocation = resolve(process.cwd(), CERT_LOCATION ?? '')

  // The absolute path of each file on the server
  const domainCert = resolve(certLocation, DOMAIN_CERT ?? '')
  const intermediateCert = resolve(certLocation, INTERMEDIATE_CERT ?? '')
  const privateKey = resolve(certLocation, PRIVATE_KEY ?? '')
  const publicKey = resolve(certLocation, PUBLIC_KEY ?? '')

  return {
    certLocation,
    certFiles: {
      domainCert,
      intermediateCert,
      privateKey,
      publicKey,
    },
  }
}

async function queryCerts() {
  const res = await axios({
    method: 'POST',
    url: `/ssl/retrieve/${process.env.DOMAIN}`,
    data: { ...getAuth() },
  })

  if (!isOk(res.data)) {
    console.log(res.data.message)
    return
  }

  const {
    certificatechain: domainCert,
    intermediatecertificate: intermediateCert,
    privatekey: privateKey,
    publickey: publicKey,
  } = res.data

  return {
    domainCert,
    intermediateCert,
    privateKey,
    publicKey,
  }
}

function readCerts() {
  const localCerts = {}

  const { certFiles } = getFilePaths()
  Object.keys(certFiles).map((key) => {
    try {
      const path = certFiles[key]
      const content = readFileSync(path, 'utf-8')
      localCerts[key] = content
    } catch (e) {
      // console.log(e)
    }
  })

  return localCerts
}

function isSame(newContent, oldContent) {
  const pattern = /\r?\n/g
  const normalizedNewContent = newContent.replace(pattern, '')
  const normalizedOldContent = oldContent.replace(pattern, '')
  return normalizedNewContent === normalizedOldContent
}

function saveCerts(newCerts, oldCerts) {
  const { certLocation, certFiles } = getFilePaths()
  if (!existsSync(certLocation)) {
    mkdirSync(certLocation)
  }

  // Returns a boolean value to tell if the service needs to be restarted
  return Object.keys(newCerts)
    .map((key) => {
      const newContent = newCerts[key] ?? ''
      const oldContent = oldCerts[key] ?? ''
      if (!isSame(newContent, oldContent)) {
        writeFileSync(certFiles[key], newCerts[key])
        return true
      }
      return false
    })
    .some((i) => i)
}

async function run() {
  const certs = await queryCerts()
  if (!certs) return

  // No need to restart the service if the file has not changed
  const localCerts = readCerts()
  const restartable = saveCerts(certs, localCerts)
  if (!restartable) return

  // Restart the service for the new certificate to take effect
  await sleep(5000)
  execSync(process.env.RESTART_COMMAND)
}

// https://github.com/node-schedule/node-schedule
const taskConfig = {
  dayOfWeek: 1,
  hour: 0,
  minute: 47,
  second: 0,
}

function task() {
  run().catch((e) => {
    console.log(e)
  })
}

schedule.scheduleJob(taskConfig, task)
