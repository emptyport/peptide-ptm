/**
 * {
 *   title: 'Acetyl',
 *   full_name: 'Acetylation',
 *   id: '1',
 *   mass_mono: '42.010565',
 *   mass_avg: '42.010565',
 *   composition: {
 *       'C': 2,
 *       'H': 2,
 *       'O': 1
 *   },
 *   specificity: [
 *       {
 *           'site': 'C',
 *           'position': 'N-term',
 *           'classification: 'Post-translational'
 *       }
 *   ]
 * }
 */

class Modification {
  constructor({
    title,
    fullName,
    id,
    massMono,
    massAvg,
    composition,
    specificity,
  }) {
    this.title = title;
    this.fullName = fullName;
    this.id = id;
    this.massMono = parseFloat(massMono);
    this.massAvg = parseFloat(massAvg);
    this.composition = composition;
    this.specificity = specificity;
  }
}

module.exports = Modification;
