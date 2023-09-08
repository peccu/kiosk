export module TypeGuard {
  // based on https://medium.com/@wujido20/runtime-types-in-typescript-5f74fc9dc6c4
  type TypeGuard<T> = (val: unknown) => T

  const names = new Map()
  export const name = (inner: TypeGuard<any>): string => {
    const name = names.get(inner)
    if (name) {
      return name
    }
    return 'other'
  }

  export const boolean: TypeGuard<boolean> = (val: unknown) => {
    if (typeof val !== 'boolean') {
      throw new Error(`should be boolean but ${typeof val}`)
    }
    return val
  }
  names.set(boolean, 'boolean')

  export const string: TypeGuard<string> = (val: unknown) => {
    if (typeof val !== 'string') {
      throw new Error(`should be string but ${typeof val}`)
    }
    return val
  }
  names.set(string, 'string')

  export const number: TypeGuard<number> = (val: unknown) => {
    if (typeof val !== 'number') {
      throw new Error(`should be number but ${typeof val}`)
    }
    return val
  }
  names.set(number, 'number')

  export const array =
    <T>(inner: TypeGuard<T>) =>
    (val: unknown): T[] => {
      if (!Array.isArray(val)) {
        throw new Error(`should be array but ${typeof val}`)
      }
      return val.map(inner)
    }
  names.set(array, 'array')

  // テスト対象T
  // キーがstring、値がTypeGuard<any>のオブジェクト(record)
  // という<これ>
  // 実際のオブジェクトはinner
  // valを引数にテスト後のオブジェクトを返す関数を返している。
  // innerが型定義、再起的に型定義を呼び出した結果をoutにつめて返している
  export const object = <T extends Record<string, TypeGuard<any>>>(
    inner: T,
  ) => {
    return (val: unknown): { [P in keyof T]: ReturnType<T[P]> } => {
      if (val === null || typeof val !== 'object') {
        throw new Error(`should be object but ${typeof val}`)
      }
      const out: { [P in keyof T]: ReturnType<T[P]> } = {} as any
      for (const k in inner) {
        try {
          // nullable parameter?
          // inner[k]の引数に、実際のテスト対象オブジェクト(値)を渡して、
          // 問題なければそのままout[k]に入れて最後にoutを返す
          // ので、inner[k]がoptionalなら、というような関数でラップしてあげればいいみたい
          // で、そのためには自分自身を返す、見たいな型 t.undefined, t.nullableみたいなのがいるのか
          // t.union([t.undefined, t.string])
          // optionalでキーがない場合、 (val as any)[k] が undefined になるはず。
          // undefinedも許容する形にする
          // ので、unionなのか。なるほど。
          out[k] = inner[k]((val as any)[k])
        } catch (e) {
          // TODO ネストしてた場合にメッセージが冗長なので、エラーオブジェクトを作って結合する必要ある。
          // a.b.c shoud be XXX のような
          throw new Error(`some error in key:${k} val:${val}. orig:${e}`)
        }
      }
      return out
    }
  }
  names.set(object, 'object')

  export const undefined = (val: unknown) => {
    if (typeof val !== 'undefined') {
      throw new Error(`should be undefined but ${typeof val}`)
    }
    return val
  }
  names.set(undefined, 'undefined')

  export const union =
    (inner: TypeGuard<any>[]) =>
    (val: unknown): TypeGuard<any> => {
      if (!Array.isArray(inner)) {
        throw new Error(
          `internal error. argument of union shoud be array but ${typeof inner}`,
        )
      }
      for (const k in inner) {
        try {
          return inner[k](val) as any
        } catch (e) {}
      }
      throw new Error(`should be ${inner.map(name).join('|')}`)
    }
  names.set(union, 'union')

  export const optional =
    (inner: TypeGuard<any>) =>
    (val: unknown): TypeGuard<any> => {
      return union([undefined, inner])(val)
    }
  names.set(optional, 'optional')
}

export default TypeGuard
