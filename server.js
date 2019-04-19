'use strict'

const { billServiceUriSUNAT } = require('./config')

const fs = require('fs')
const JSZip = require('jszip')
const fetch = require('isomorphic-unfetch')
const buildSendBillxml = require('./services/buildSendBillxml')

// const fileName = '20100066603-03-B001-000001'
const fileName = '20100066603-01-F001-000007'
const xmlFileString = fs.readFileSync('./xml-listos/' + fileName + '.xml', 'utf-8')


let zip = new JSZip()
zip.file(fileName + '.xml', xmlFileString)

zip.generateAsync({ type: 'base64' })
.then(zipFileBase64 => {
    
    let _xml = buildSendBillxml(fileName, zipFileBase64)

    return fetch(billServiceUriSUNAT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: _xml
    })
})
.then(res => res.text())
.then(res => console.log(res))
.catch(err => console.log(err))