import { Testlogger } from './includes/TexrxCommonInclude.js';
import { TenrxVisitType, useTenrxStorage } from '../src/index.js';

Testlogger.setSettings({
  type: 'pretty',
});

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

test('TenrxStorage Test Successful', async () => {
  const storage = useTenrxStorage();
  const testobject: TenrxTestStorageObject = {
    key: 'value',
    key2: 'value2',
    key3: 'value3',
    key4: [{ subkey: 'subvalue', subkey2: 'subvalue2', subkey3: 'subvalue3' }],
  };
  await storage.save<TenrxTestStorageObject>('persistent', 'test', testobject);
  const objectread = await storage.load<TenrxTestStorageObject>('persistent', 'test');
  expect(objectread).not.toBeNull();
  expect(objectread!.key).toBe(testobject.key);
  expect(objectread!.key2).toBe(testobject.key2);
  expect(objectread!.key3).toBe(testobject.key3);
  expect(objectread!.key4[0].subkey).toBe(testobject.key4[0].subkey);
  expect(objectread!.key4[0].subkey2).toBe(testobject.key4[0].subkey2);
  expect(objectread!.key4[0].subkey3).toBe(testobject.key4[0].subkey3);
});
