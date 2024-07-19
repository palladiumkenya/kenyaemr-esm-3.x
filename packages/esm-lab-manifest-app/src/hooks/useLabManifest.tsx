import { labManifest } from '../lab-manifest.mock';

const useLabManifest = (manifestUuid: string) => {
  return {
    isLoading: false,
    error: undefined,
    manifest: labManifest.find((m) => m.uuid === manifestUuid),
  };
};

export default useLabManifest;
