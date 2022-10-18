import { Testlogger } from './includes/TexrxCommonInclude.js';
import { TenrxVisitType, useTenrxStorage } from '../src/index.js';

Testlogger.setSettings({
  type: 'pretty',
});

jest.setTimeout(60000);

type TenrxTestStorageObject = {
  key: string;
  key2: string;
  key3: string;
  key4: [
    {
      subkey: string;
      subkey2: string;
      subkey3: string;
    },
  ];
};

const testobject: TenrxTestStorageObject = {
  key: 'value',
  key2: 'value2',
  key3: 'value3',
  key4: [{ subkey: 'subvalue', subkey2: 'subvalue2', subkey3: 'subvalue3' }],
};

test('TenrxStorage Asynchronous Test Successful', async () => {
  const storage = useTenrxStorage();

  await storage.save<TenrxTestStorageObject>('persistent', 'testasync', testobject);
  const objectread = await storage.load<TenrxTestStorageObject>('persistent', 'testasync');
  expect(objectread).not.toBeNull();
  expect(objectread!.key).toBe(testobject.key);
  expect(objectread!.key2).toBe(testobject.key2);
  expect(objectread!.key3).toBe(testobject.key3);
  expect(objectread!.key4[0].subkey).toBe(testobject.key4[0].subkey);
  expect(objectread!.key4[0].subkey2).toBe(testobject.key4[0].subkey2);
  expect(objectread!.key4[0].subkey3).toBe(testobject.key4[0].subkey3);
});

test('TenrxStorage Synchronous Test Successful', () => {
  const storage = useTenrxStorage();

  storage.saveSync<TenrxTestStorageObject>('persistent', 'testsync', testobject);
  const objectread = storage.loadSync<TenrxTestStorageObject>('persistent', 'testsync');
  expect(objectread).not.toBeNull();
  expect(objectread!.key).toBe(testobject.key);
  expect(objectread!.key2).toBe(testobject.key2);
  expect(objectread!.key3).toBe(testobject.key3);
  expect(objectread!.key4[0].subkey).toBe(testobject.key4[0].subkey);
  expect(objectread!.key4[0].subkey2).toBe(testobject.key4[0].subkey2);
  expect(objectread!.key4[0].subkey3).toBe(testobject.key4[0].subkey3);
});
