const tape = require('tape');
const { hello } = require('../../dist/cjs/index.js');

tape('CJS Module Test', (t) => {
    t.test('should run the hello function from CJS build', (assert) => {
        console.log('Testing CJS build:');
        hello();
        assert.pass('hello function ran successfully');
        assert.end();
    });
});
