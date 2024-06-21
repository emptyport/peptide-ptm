const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const defaultMods = require('./defaultMods.json');
const Modification = require('./Modification');

class PTM {
  constructor(loadFromFile = false, fileName = null) {
    this.name = 'PTM';
    this.mods = {};

    if (loadFromFile) {
      this.loadFromUnimodXml(fileName);
    } else {
      this.loadDefault();
    }
  }

  loadDefault() {
    this.mods = defaultMods.map((mod) => new Modification(mod));
  }

  loadFromUnimodXml(fileName) {
    const fullPath = fileName
      ? path.join(path.dirname(require.main.filename), fileName)
      : path.join(path.dirname(require.main.filename), 'unimod.xml');

    try {
      const xml = fs.readFileSync(fullPath, 'utf8');
      this.mods = this.parseXmlMods(xml);
    } catch (err) {
      console.error(err);
      throw new Error(`Failed to load ${fullPath}`);
    }
  }

  parseXmlMods(xml) {
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    };
    const parser = new XMLParser(options);
    const xmlDoc = parser.parse(xml);
    let mods = xmlDoc['umod:unimod']['umod:modifications']['umod:mod'];
    if (!Array.isArray(mods)) {
      mods = [mods];
    }
    const modifications = mods.map((mod) => {
      const title = mod['@_title'];
      const fullName = mod['@_full_name'];
      const id = mod['@_record_id'];
      const massMono = mod['umod:delta']['@_mono_mass'];
      const massAvg = mod['umod:delta']['@_avge_mass'];
      const compositionElements = mod['umod:delta']['umod:element'];
      const composition = compositionElements.reduce((acc, elem) => {
        acc[elem['@_symbol']] = parseInt(elem['@_number'], 10);
        return acc;
      }, {});
      const specificity = mod['umod:specificity'].map((spec) => {
        const site = spec['@_site'];
        const position = spec['@_position'];
        const classification = spec['@_classification'];
        return { site, position, classification };
      });

      return new Modification({
        title,
        fullName,
        id,
        massMono,
        massAvg,
        composition,
        specificity,
      });
    });
    return modifications;
  }
}

module.exports = PTM;
