const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const defaultMods = require('./defaultMods.json');
const Modification = require('./Modification');

class PTM {
  constructor(loadFromFile = false, fileName = null) {
    this.name = 'PTM';
    this.mods = {};
    this.nameToIdMapping = {};
    let modList = [];

    /** position
     * <xs:enumeration value="Anywhere"/>
<xs:enumeration value="Any N-term"/>
<xs:enumeration value="Any C-term"/>
<xs:enumeration value="Protein N-term"/>
<xs:enumeration value="Protein C-term"/>
     */

    /** classification
     * <xs:enumeration value="-"/>
<xs:enumeration value="Post-translational"/>
<xs:enumeration value="Co-translational"/>
<xs:enumeration value="Pre-translational"/>
<xs:enumeration value="Chemical derivative"/>
<xs:enumeration value="Artefact"/>
<xs:enumeration value="N-linked glycosylation"/>
<xs:enumeration value="O-linked glycosylation"/>
<xs:enumeration value="Other glycosylation"/>
<xs:enumeration value="Synth. pep. protect. gp."/>
<xs:enumeration value="Isotopic label"/>
<xs:enumeration value="Non-standard residue"/>
<xs:enumeration value="Multiple"/>
<xs:enumeration value="Other"/>
<xs:enumeration value="AA substitution"/>
<xs:enumeration value="Cross-link"/>
<xs:enumeration value="CID cleavable cross-link"/>
<xs:enumeration value="Photo cleavable cross-link"/>
<xs:enumeration value="Other cleavable cross-link"/>
     */

    if (loadFromFile) {
      modList = this.loadFromUnimodXml(fileName);
    } else {
      modList = this.loadDefault();
    }

    modList.forEach((mod) => {
      this.mods[mod.id] = mod;
      this.nameToIdMapping[mod.title] = mod.id;
    });
  }

  getById(id) {
    return this.mods[id];
  }

  getByName(name) {
    return this.mods[this.nameToIdMapping[name]];
  }

  getByMassAvg(mass, tolerance) {
    return this.getByMass(mass, tolerance, 'massAvg');
  }

  getByMassMono(mass, tolerance) {
    return this.getByMass(mass, tolerance, 'massMono');
  }

  getByMass(mass, tolerance, massType) {
    const mods = Object.values(this.mods);
    return mods
      .filter(
        (mod) =>
          mod[massType] - tolerance <= mass && mass <= mod[massType] + tolerance
      )
      .sort((a, b) => a[massType] - b[massType]);
  }

  getContainingElement(element) {
    const mods = Object.values(this.mods);
    return mods.filter((mod) => mod.composition[element] !== undefined);
  }

  disambiguateAminoAcids(symbols) {
    const ambiguousMap = {
      B: ['D', 'N'],
      Z: ['E', 'Q'],
      J: ['I', 'L'],
    };

    const resolvedSymbols = [];
    symbols.forEach((symbol) => {
      if (ambiguousMap[symbol]) {
        resolvedSymbols.push(...ambiguousMap[symbol]);
      } else {
        resolvedSymbols.push(symbol);
      }
    });
    return resolvedSymbols;
  }

  getBySpecificity({ sites = [], positions = [], classifications = [] }) {
    /**
     * This will use an OR within each field, and an AND to
     * combine the results. For example, if you do sites ['K', 'N']
     * and positions ['N-term', 'C-term'], then the resulting filter
     * would be (site = 'K' OR site = 'N') AND (position = 'N-term' OR position = 'C-term')
     */

    const resolvedSites = this.disambiguateAminoAcids(sites);

    return Object.values(this.mods);
  }

  loadDefault() {
    return defaultMods.map((mod) => new Modification(mod));
  }

  loadFromUnimodXml(fileName) {
    const fullPath = fileName
      ? path.join(path.dirname(require.main.filename), fileName)
      : path.join(path.dirname(require.main.filename), 'unimod.xml');

    try {
      const xml = fs.readFileSync(fullPath, 'utf8');
      return this.parseXmlMods(xml);
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
