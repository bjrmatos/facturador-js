

const fs = require('fs')
const Dom = require('xmldom-fork-fixed').DOMParser
const SignedXml = require('xml-crypto').SignedXml
const pem = require('pem')
pem.config({
    pathOpenSSL: './bin/openssl'
})

const pfx = fs.readFileSync('./certificados/certificado_prueba_aes.pfx')

// const fileName = '20100066603-03-B001-000001'
const fileName = '20100066603-01-F001-000007'
let xmlFileString = fs.readFileSync('./examples/' + fileName + 'clean.xml', 'utf-8')
// xmlFileString = new Dom({ ignoreWhiteSpace: true }).parseFromString(xmlFileString).toString()


pem.readPkcs12(pfx, { p12Password: '123456' }, (err, pem) => {
    if (err) return console.log(err)

    const infoProvider = pem => {
        return {
            getKeyInfo() {
                const cert = this.getCert();
                return `<ds:X509Data><ds:X509Certificate>${ cert }</ds:X509Certificate></ds:X509Data>`
            },
            getCert() {
                let certLines = pem.cert.split('\r\n')
                return certLines.filter((e, i) => i && e && e.indexOf('-----') !== 0).join('')
            }
        }
    }

    let sig = new SignedXml()

    sig.addReference(
        "//*[local-name(.)='ExtensionContent']", // xpath
        [ 'http://www.w3.org/2000/09/xmldsig#enveloped-signature' ], // transforms
        [ 'http://www.w3.org/2000/09/xmldsig#sha1' ], // digestAlgorithm
        '',
        '',
        '',
        true
    )
    sig.signingKey = pem.key
    sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
    sig.keyInfoProvider = infoProvider(pem)
    sig.computeSignature(xmlFileString, {
        prefix: 'ds',
        attrs: { Id: 'SignatureSP' },
        location: { reference: "//*[local-name(.)='ExtensionContent']", action: "prepend" },
        existingPrefixes: {
            'ds': 'http://www.w3.org/2000/09/xmldsig#'
        }
    })

    fs.writeFileSync('./xml-listos/' + fileName + '.XML', sig.getSignedXml())
})