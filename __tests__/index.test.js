const X = require('../');

const html = /*html*/ `<div>
  <div class="main">
    <h1>ixi</h1>
    <ul>
      <li>one</li>
      <li>two</li>
    </ul>
  </div>
  <ul>
    <li>three</li>
  </ul>
</div>`;

describe('test', () => {
  it('default', () => {
    const x = X(html);

    expect(x('h1')).toEqual('ixi');
    expect(x(['li'])).toEqual(['one', 'two', 'three']);
    expect(
      x({
        $root: '.main',
        title: 'h1',
        items: ['li']
      })
    ).toEqual({
      title: 'ixi',
      items: ['one', 'two']
    });
  });
});
