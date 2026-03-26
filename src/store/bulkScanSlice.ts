import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

export type ScannedItem = {
  id: string;
  barcode: string;
  timestamp: string;
  loading: boolean;
  nombre: string | null;
  imagenes: string[] | null;
  quantity: number;
  highlightCount: number;
};

interface BulkScanState {
  items: ScannedItem[];
  selectedRutaId: number | null;
  firma: string | null;
}

const initialState: BulkScanState = {
  items: [],
  selectedRutaId: null,
  firma: null,
};

const bulkScanSlice = createSlice({
  name: 'bulkScan',
  initialState,
  reducers: {
    addScannedItem(state, action: PayloadAction<{id: string; barcode: string; timestamp: string}>) {
      state.items.unshift({
        ...action.payload,
        loading: true,
        nombre: null,
        imagenes: null,
        quantity: 1,
        highlightCount: 0,
      });
    },
    incrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.barcode === action.payload);
      if (item) {
        item.quantity += 1;
        item.highlightCount += 1;
      }
    },
    setQuantity(state, action: PayloadAction<{barcode: string; quantity: number}>) {
      const item = state.items.find(i => i.barcode === action.payload.barcode);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    updateScannedItem(state, action: PayloadAction<{id: string; nombre: string; imagenes: string[]}>) {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.loading = false;
        item.nombre = action.payload.nombre;
        item.imagenes = action.payload.imagenes;
      }
    },
    failScannedItem(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.loading = false;
      }
    },
    removeScannedItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    selectRuta(state, action: PayloadAction<number | null>) {
      state.selectedRutaId = action.payload;
    },
    setFirma(state, action: PayloadAction<string | null>) {
      state.firma = action.payload;
    },
    clearScannedItems(state) {
      state.items = [];
      state.selectedRutaId = null;
      state.firma = null;
    },
  },
});

export const {addScannedItem, incrementQuantity, setQuantity, updateScannedItem, failScannedItem, removeScannedItem, selectRuta, setFirma, clearScannedItems} = bulkScanSlice.actions;
export default bulkScanSlice.reducer;
