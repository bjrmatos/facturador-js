'use strict'

const { usernameSUNAT, passwordSUNAT } = require('../config')


module.exports = (zipFileName, zipFileBase64) => {

    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.sunat.gob.pe" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
        <soapenv:Header>
            <wsse:Security>
                <wsse:UsernameToken>
                    <wsse:Username>${ usernameSUNAT }</wsse:Username>
                    <wsse:Password>${ passwordSUNAT }</wsse:Password>
                </wsse:UsernameToken>
            </wsse:Security>
        </soapenv:Header>
        <soapenv:Body>
            <ser:sendBill>
                <fileName>${ zipFileName }.ZIP</fileName>
                <contentFile>${ zipFileBase64 }</contentFile>
            </ser:sendBill>
        </soapenv:Body>
    </soapenv:Envelope>`

}