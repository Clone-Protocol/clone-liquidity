import { atom } from 'recoil'

export const syncFetchNetworkState = atom({
  key: 'syncFetchNetworkState',
  default: false,
})