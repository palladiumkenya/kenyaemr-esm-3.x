import { getGlobalStore } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';

interface OverlayStore {
  isOverlayOpen: boolean;
  component?: React.ReactNode;
  header: string;
}

const initialState = { isOverlayOpen: false, component: null, header: '' };

const getOverlayStore = () => {
  return getGlobalStore('radiology', initialState);
};

export const launchOverlay = (headerTitle: string, componentToRender) => {
  const store = getOverlayStore();
  store.setState({
    isOverlayOpen: true,
    component: componentToRender,
    header: headerTitle,
  });
};

export const closeOverlay = () => {
  const store = getOverlayStore();
  store.setState({ component: null, isOverlayOpen: false });
};

export const useOverlay = () => {
  const [overlay, setOverlay] = useState<OverlayStore>();

  useEffect(() => {
    function update(state: OverlayStore) {
      setOverlay(state);
    }

    update(getOverlayStore().getState());
    getOverlayStore().subscribe(update);
  }, []);

  return {
    isOverlayOpen: overlay?.isOverlayOpen,
    component: overlay?.component,
    header: overlay?.header,
  };
};
