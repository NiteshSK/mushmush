import { configureStore, combineReducers, type Middleware } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";

// Imports for redux-persist
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// Import your reducers
import quickViewReducer from "./features/quickView-slice";
import cartReducer, { addItemToCart } from "./features/cart-slice";
import { trackVisitAction } from "@/lib/visit-analytics";
import wishlistReducer from "./features/wishlist-slice";
import productDetailsReducer from "./features/product-details";

// Combine your reducers
const rootReducer = combineReducers({
  quickViewReducer,
  cartReducer,
  wishlistReducer,
  productDetailsReducer,
});

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cartReducer'], // Only cartReducer will be persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const trackCartAdds: Middleware<Record<never, never>, ReturnType<typeof persistedReducer>> =
  ({ getState }) => next => action => {
    if (!addItemToCart.match(action)) return next(action);
    const { id, slug } = action.payload;
    const quantity = () => getState().cartReducer?.items.find(item => item.id === id)?.quantity ?? 0;
    const before = quantity();
    const result = next(action);
    if (quantity() > before) trackVisitAction("bag_add", slug);
    return result;
  };

export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(trackCartAdds),
});

// Export the persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
