'use strict'

const { billServiceUriSUNAT } = require('./config')

const fetch = require('isomorphic-unfetch')
const buildSendBill = require('./services/buildSendBill')

const fs = require('fs')
let zipFileBase64 = fs.readFileSync('./examples/20100066603-03-B001-000001.zip', 'base64')

let _xml = buildSendBill('20100066603-03-B001-000001', zipFileBase64)

fetch(billServiceUriSUNAT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: _xml
})
.then(res => res.text())
.then(res => console.log(res))
.catch(err => console.log(err))