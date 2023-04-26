import { isEmpty, isArray } from 'lodash-es';

interface Filter {
  (item: { [key: string]: any }): boolean;
}

interface FilterCreater {
  (query: string, keys?: string | string[]): Filter;
}

/**
 * 用于快速创建一个 Filter 函数
 * Original author is Kevin, refactor by Jeffy
 *
 * @param {*} query
 * @param {*} [rawKeys=[]]
 * @returns
 */
export const createFilter: FilterCreater = (searchQuery, rawKeys = []) => {
  if (searchQuery == null || searchQuery?.trim() === '') return () => true;

  if (!rawKeys) return () => true;

  if (isArray(rawKeys) && !rawKeys.length) return () => true;

  const keys = isArray(rawKeys) ? rawKeys : [rawKeys];
  const lowerCaseSearchQuery = searchQuery.toLowerCase();

  return (item) => {
    for (const key of keys) {
      const isSearchQueryMatch = item?.[key]
        ?.toLowerCase()
        .includes(lowerCaseSearchQuery);

      if (isSearchQueryMatch) return true;
    }

    return false;
  };
};

export const createUserFilter = (query) => (u) => {
  const userWithPinyinNumberRemoved = {
    ...u,
    name_pinyin: isEmpty(u.name_pinyin) ? '' : u.name_pinyin.replace(/\d/g, ''),
  };

  return createFilter(query, ['name_pinyin', 'name', 'email'])(
    userWithPinyinNumberRemoved
  );
};
