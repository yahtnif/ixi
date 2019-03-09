const X = require('../');

const html = `<ul>
  <li>one</li>
  <li>two</li>
  <li>three</li>
</ul>`;

describe('test', () => {
  it('default', () => {
    const x = X(html);
    expect(x(['li'])).toEqual(['one', 'two', 'three']);
  });
});
