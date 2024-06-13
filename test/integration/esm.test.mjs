import { hello } from '../../dist/esm/index.js';
import tape from 'tape';

tape('ESM Module Test', (t) => {
    t.test('should run the hello function from ESM build', (assert) => {
        console.log('Testing ESM build:');
        hello();
        assert.pass('hello function ran successfully');
        assert.end();
    });
});
