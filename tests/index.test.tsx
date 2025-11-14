import ListyEntry from '../src/index';
import ListyImpl from '../src/List';

describe('package entry point', () => {
  it('re-exports the Listy implementation', () => {
    expect(ListyEntry).toBe(ListyImpl);
  });
});
