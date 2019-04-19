var select = require('xml-crypto').xpath
    , dom = require('xmldom').DOMParser
    , KeyInfoProvider = require('./KeyInfoProvider')
    , SignedXml = require('xml-crypto').SignedXml
    // , FileKeyInfo = require('xml-crypto').FileKeyInfo
    , fs = require('fs')

const pem = require('pem')
pem.config({
    pathOpenSSL: './bin/openssl'
})
const pfx = fs.readFileSync('./certificados/certificado_prueba_aes.pfx')

const UBL_EXTENSION_NAMESPACE = (
  'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2'
)

const XPATH_TO_SIGNATURE_CONTAINER = (
  '//*[local-name(.)="UBLExtensions" and ' +
  'namespace-uri(.)="' + UBL_EXTENSION_NAMESPACE + '"]' +
  '/*[local-name(.)="UBLExtension" and ' +
  'namespace-uri(.)="' + UBL_EXTENSION_NAMESPACE + '"][last()]' +
  '/*[local-name(.)="ExtensionContent" and ' +
  'namespace-uri(.)="' + UBL_EXTENSION_NAMESPACE + '"][last()]'
)

pem.readPkcs12(pfx, { p12Password: '123456' }, (err, pem) => {
    if (err) return console.log(err)

    var xml = fs.readFileSync("./xml-listos/20100066603-01-F001-000007.xml").toString()
    var doc = new dom().parseFromString(xml)

    var signature = select(doc, `${XPATH_TO_SIGNATURE_CONTAINER}/*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']`)[0]
    var sig = new SignedXml()
    sig.keyInfoProvider = new KeyInfoProvider(pem.cert)
    debugger
    sig.loadSignature(signature)
    var res = sig.checkSignature(xml)
    if (!res) console.log(sig.validationErrors)
})
