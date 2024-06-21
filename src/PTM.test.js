const tape = require('tape');
const PTM = require('./PTM');

tape('PTM.parseXmlMods should correctly parse XML into modifications', (t) => {
  const xmlInput = `
    <umod:unimod xmlns:umod="http://www.unimod.org/xmlns/schema/unimod_2">
        <umod:modifications>  
            <umod:mod title="TestMod" full_name="Test Modification" record_id="999">
                <umod:delta mono_mass="12.011" avge_mass="12.0107" composition="C">
                <umod:element symbol="C" number="1"/>
                <umod:element symbol="H" number="2"/>
                </umod:delta>
                <umod:specificity site="K" position="Anywhere" classification="Post-translational" spec_group="1"/>
                <umod:specificity site="N" position="Anywhere" classification="Post-translational" spec_group="1"/>
            </umod:mod>
        </umod:modifications>
    </umod:unimod>
  `;

  const ptm = new PTM();
  const modifications = ptm.parseXmlMods(xmlInput);

  t.equal(modifications.length, 1, 'Should parse one modification');
  t.equal(modifications[0].title, 'TestMod', 'Should have correct title');
  t.equal(
    modifications[0].fullName,
    'Test Modification',
    'Should have correct full name'
  );
  t.equal(modifications[0].id, '999', 'Should have correct id');
  t.equal(modifications[0].massMono, 12.011, 'Should have correct mono mass');
  t.equal(
    modifications[0].massAvg,
    12.0107,
    'Should have correct average mass'
  );
  t.deepEqual(
    modifications[0].composition,
    { C: 1, H: 2 },
    'Should have correct composition'
  );
  t.deepEqual(
    modifications[0].specificity,
    [
      { site: 'K', position: 'Anywhere', classification: 'Post-translational' },
      { site: 'N', position: 'Anywhere', classification: 'Post-translational' },
    ],
    'Should have correct specificity'
  );

  t.end();
});

tape('PTM.loadDefault should load default modifications', (t) => {
  const ptm = new PTM();
  const modifications = ptm.mods;
  t.equal(
    Object.keys(modifications).length,
    11,
    'Should load 11 modifications'
  );

  t.end();
});

tape('PTM.getById should retrieve modifications by id', (t) => {
  const ptm = new PTM();
  const existingMod = ptm.getById('21');
  t.equal(
    existingMod.title,
    'Phosphorylation',
    'Should retrieve the modification with title TestMod'
  );

  const nonExistingMod = ptm.getById('1000');
  t.equal(
    nonExistingMod,
    undefined,
    'Should return undefined for non-existing id'
  );

  t.end();
});

tape('PTM.getByName should retrieve modifications by name', (t) => {
  const ptm = new PTM();
  const existingMod = ptm.getByName('Phosphorylation');
  t.equal(
    existingMod.title,
    'Phosphorylation',
    'Should retrieve the modification with title TestMod'
  );

  const nonExistingMod = ptm.getByName('TestMod');
  t.equal(
    nonExistingMod,
    undefined,
    'Should return undefined for non-existing name'
  );

  t.end();
});
