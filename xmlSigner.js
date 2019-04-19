

const fs = require('fs')
// const Dom = require('xmldom-fork-fixed').DOMParser
const SignedXml = require('xml-crypto').SignedXml
const pem = require('pem')
const KeyInfoProvider = require('./KeyInfoProvider')

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

// const fileName = '20100066603-03-B001-000001'
const fileName = '20100066603-01-F001-000007'
let xmlFileString = fs.readFileSync('./examples/' + fileName + 'clean.xml', 'utf-8')
// xmlFileString = new Dom({ ignoreWhiteSpace: true }).parseFromString(xmlFileString).toString()


pem.readPkcs12(pfx, { p12Password: '123456' }, (err, pem) => {
    if (err) return console.log(err)

    let sig = new SignedXml()

    sig.addReference(
        // referencia al nodo a firmar (en este caso el nodo principal, se firma todo el documento)
        '/*', // xpath
        // transformaciones a las referencias
        [
          'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
          // SIEMPRE ESPECIFICAR ESTE TRANSFORM, DEBIDO A QUE INSERTAMOS EL NODO
          // CONTENEDOR DE LA FIRMA EN TIEMPO DE EJECUCION TOTALMENTE VACIO, XMLDOM
          // AL SERIALIZAR UN NODO VACIO LO GENERA ASI `<NodoVacio />`,
          // ESTE TRANSFORM ASEGURA DE QUE ESTE NODO VACIO
          // SEA CONVERTIDO A `<NodoVacio></NodoVacio>`
          'http://www.w3.org/2001/10/xml-exc-c14n#'
        ], // transforms
        'http://www.w3.org/2000/09/xmldsig#sha1', // digestAlgorithm
        '',
        '',
        '',
        // Deja el vacio el atributo URI del nodo firmado
        true
    )
    sig.signingKey = pem.key
    sig.keyInfoProvider = new KeyInfoProvider(pem.cert)
    sig.computeSignature(xmlFileString, {
        prefix: 'ds',
        attrs: { Id: 'F001-000007' },
        location: { reference: XPATH_TO_SIGNATURE_CONTAINER, action: "append" }
    })

    fs.writeFileSync('./xml-listos/' + fileName + '.XML', sig.getSignedXml())
})
