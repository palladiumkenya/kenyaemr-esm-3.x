import { useMemo } from 'react';
import { FrontendModule } from '../types';

export function useFrontendModules() {
  return useMemo<Array<FrontendModule>>(() => {
    return (window.installedModules ?? [])
      .filter((module) => Boolean(module) && Boolean(module[1]))
      .map((module) => ({
        version: module[1].version,
        name: module[0].substring(module[0].indexOf('/') + 1),
      }));
  }, []);
}
