var select = require('xml-crypto').xpath
    , dom = require('xmldom').DOMParser
    , SignedXml = require('xml-crypto').SignedXml
    // , FileKeyInfo = require('xml-crypto').FileKeyInfo  
    , fs = require('fs')

const pem = require('pem')
pem.config({
    pathOpenSSL: './bin/openssl'
})
const pfx = fs.readFileSync('./certificados/certificado_prueba_aes.pfx')


pem.readPkcs12(pfx, { p12Password: '123456' }, (err, pem) => {
    if (err) return console.log(err)

    const infoProvider = pem => {
        return {
            getKey() {
                const cert = this.getCert();
                return `<ds:X509Data><ds:X509Certificate>${ cert }</ds:X509Certificate></ds:X509Data>`
            },
            getCert() {
                let certLines = pem.cert.split('\n')
                return certLines.filter((e, i) => i && e && e.indexOf('-----') !== 0).join('')
            }
        }
    }

    var xml = fs.readFileSync("./xml-listos/20100066603-01-F001-000007.xml").toString()
    var doc = new dom().parseFromString(xml)    
    
    var signature = select(doc, "//*[local-name(.)='ExtensionContent']")[0]
    var sig = new SignedXml()
    sig.keyInfoProvider = infoProvider(pem)
    sig.loadSignature(signature)
    var res = sig.checkSignature(xml)
    if (!res) console.log(sig.validationErrors)
})