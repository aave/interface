import { produce } from 'immer';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export interface FavoriteMarketsSlice {
  favoriteMarkets: CustomMarket[];
  isFavoriteMarket: (market: CustomMarket) => boolean;
  toggleFavoriteMarket: (market: CustomMarket) => void;
  getFavoriteMarkets: () => CustomMarket[];
  hydrateFavoriteMarkets: () => void;
}

const FAVORITE_MARKETS_STORAGE_KEY = 'aave-favorite-markets';

const getFavoriteMarketsFromStorage = (): CustomMarket[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(FAVORITE_MARKETS_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Ensure we always return an array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading favorite markets from localStorage:', error);
    return [];
  }
};

const saveFavoriteMarketsToStorage = (favoriteMarkets: CustomMarket[]) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(FAVORITE_MARKETS_STORAGE_KEY, JSON.stringify(favoriteMarkets));
  } catch (error) {
    console.error('Error saving favorite markets to localStorage:', error);
  }
};

export const createFavoriteMarketsSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  FavoriteMarketsSlice
> = (set, get) => ({
  favoriteMarkets: [],

  isFavoriteMarket: (market: CustomMarket) => {
    const favorites = get().favoriteMarkets;
    return Array.isArray(favorites) ? favorites.includes(market) : false;
  },

  toggleFavoriteMarket: (market: CustomMarket) => {
    const currentFavorites = get().favoriteMarkets;
    // Ensure currentFavorites is an array
    const favoritesArray = Array.isArray(currentFavorites) ? currentFavorites : [];
    const isFavorite = favoritesArray.includes(market);

    const newFavorites = isFavorite
      ? favoritesArray.filter((fav) => fav !== market)
      : [...favoritesArray, market];

    set((state) =>
      produce(state, (draft) => {
        draft.favoriteMarkets = newFavorites;
      })
    );

    // Save to localStorage
    saveFavoriteMarketsToStorage(newFavorites);
  },

  getFavoriteMarkets: () => {
    const favorites = get().favoriteMarkets;
    return Array.isArray(favorites) ? favorites : [];
  },

  hydrateFavoriteMarkets: () => {
    const storedFavorites = getFavoriteMarketsFromStorage();
    // Ensure we always set an array
    const favoritesToSet = Array.isArray(storedFavorites) ? storedFavorites : [];

    set((state) =>
      produce(state, (draft) => {
        draft.favoriteMarkets = favoritesToSet;
      })
    );
  },
});
