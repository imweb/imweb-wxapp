import 'miniprogram-simulate';
import { storage, Storage } from '../../src/storage/index';

describe('index', () => {
  test('the storage is Storage object, which namespace is "global"', () => {
    expect(storage instanceof Storage).toBeTruthy();
    expect(storage.namespace).toBe('__storage__/global/');
  });
});
