'use strict';

var forge = require('node-forge'),
    pki = forge.pki;

function KeyInfoProvider(certificatePEM) {
  var certificatePEMValue = certificatePEM;

  /**
   * Esto asegura de que siempre se devuelva una instancia
   * asi se aya llamado a la funcion sin `new`
   */
  if (!this instanceof KeyInfoProvider) {
    return new KeyInfoProvider();
  }

  if (Buffer.isBuffer(certificatePEMValue)) {
    certificatePEMValue = certificatePEMValue.toString('ascii');
  }

  if (certificatePEMValue == null || typeof certificatePEMValue !== 'string') {
    throw new Error('certificatePEM must be a valid certificate in PEM format');
  }

  this._certificatePEM = certificatePEMValue;

  this.getKeyInfo = function(key, prefix) {
    var keyInfoXml,
        certObj,
        certBodyInB64,
        prefixValue;

    prefixValue = prefix || '';
    prefixValue = prefixValue ? prefixValue + ':' : prefixValue;

    certBodyInB64 = forge.util.encode64(forge.pem.decode(this._certificatePEM)[0].body);
    certObj = pki.certificateFromPem(this._certificatePEM);

    keyInfoXml = '<' + prefixValue + 'X509Data>';

    keyInfoXml += '<' + prefixValue + 'X509SubjectName>';
    keyInfoXml += getSubjectName(certObj);
    keyInfoXml += '</' + prefixValue + 'X509SubjectName>';

    keyInfoXml += '<' + prefixValue + 'X509Certificate>';
    keyInfoXml += certBodyInB64;
    keyInfoXml += '</' + prefixValue + 'X509Certificate>';

    keyInfoXml += '</' + prefixValue + 'X509Data>';

    return keyInfoXml;
  };

  this.getKey = function() {
    return this._certificatePEM;
  };
}

function getSubjectName(certObj) {
  var subjectFields,
      fields = ['CN', 'OU', 'O', 'L', 'ST', 'C'];

  if (certObj.subject) {
    subjectFields = fields.reduce(function(subjects, fieldName) {
      var certAttr = certObj.subject.getField(fieldName);

      if (certAttr) {
        subjects.push(fieldName + '=' + certAttr.value);
      }

      return subjects;
    }, []);
  }

  return Array.isArray(subjectFields) ? subjectFields.join(',') : '';
}

module.exports = KeyInfoProvider;
