import React, { useReducer, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import jsonrpc from '@polkadot/types/interfaces/jsonrpc'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { keyring as Keyring } from '@polkadot/ui-keyring'
import config from '../config'

const parsedQuery = new URLSearchParams(window.location.search)
const connectedSocketSend = parsedQuery.get('rpc') || config.PROVIDER_SOCKET_SEND
// const connectedSocketRecv = parsedQuery.get('rpc') || config.PROVIDER_SOCKET_RECV
///
// Initial state for `useReducer`

const initialState = {
  // These are the states
  socket: connectedSocketSend,
  jsonrpc: { ...jsonrpc, ...config.CUSTOM_RPC_METHODS },
  keyring: null,
  keyringState: null,
  api: null,
  apiError: null,
  apiState: null,
  currentAccount: null,
}

///
// Reducer function for `useReducer`

const reducer = (state, action) => {
  switch (action.type) {
    case 'CONNECT_INIT':
      return { ...state, apiState: 'CONNECT_INIT' }
    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' }
    case 'CONNECT_SUCCESS':
      return { ...state, apiState: 'READY' }
    case 'CONNECT_ERROR':
      return { ...state, apiState: 'ERROR', apiError: action.payload }
    case 'LOAD_KEYRING':
      return { ...state, keyringState: 'LOADING' }
    case 'SET_KEYRING':
      return { ...state, keyring: action.payload, keyringState: 'READY' }
    case 'KEYRING_ERROR':
      return { ...state, keyring: null, keyringState: 'ERROR' }
    case 'SET_CURRENT_ACCOUNT':
      return { ...state, currentAccount: action.payload }
    default:
      throw new Error(`Unknown type: ${action.type}`)
  }
}

///
// Connecting to the Substrate node

const connect = (state, dispatch) => {
  const { apiState, socket, jsonrpc } = state
  // We only want this function to be performed once
  if (apiState) return

  dispatch({ type: 'CONNECT_INIT' })

  console.log(`Connected socket: ${socket}`)
  const provider = new WsProvider(socket)
  const _api = new ApiPromise({ provider, rpc: jsonrpc })

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    dispatch({ type: 'CONNECT', payload: _api })
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    _api.isReady.then(_api => dispatch({ type: 'CONNECT_SUCCESS' }))
  })
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }))
  _api.on('error', err => dispatch({ type: 'CONNECT_ERROR', payload: err }))
}

// Loading accounts from dev and polkadot-js extension
const loadAccounts = (dispatch) => {
  dispatch({ type: 'LOAD_KEYRING' })

  const asyncLoadAccounts = () => {
    try {
      Keyring.loadAll({ isDevelopment: true })
      dispatch({ type: 'SET_KEYRING', payload: Keyring })
    } catch (e) {
      console.error(e)
      dispatch({ type: 'KEYRING_ERROR' })
    }
  }
  asyncLoadAccounts()
}

const SubstrateContext = React.createContext()

let keyringLoadAll = false

const SubstrateContextProvider = props => {
  const [state, dispatch] = useReducer(reducer, initialState)
  connect(state, dispatch)

  useEffect(async () => {
    const { apiState, keyringState } = state
    if (apiState === 'READY' && !keyringState && !keyringLoadAll) {
      keyringLoadAll = true
      loadAccounts(dispatch)
    }
  }, [state, dispatch])

  function setCurrentAccount(acct) {
    dispatch({ type: 'SET_CURRENT_ACCOUNT', payload: acct })
  }

  return (
    <SubstrateContext.Provider value={{ state, setCurrentAccount }}>
      {props.children}
    </SubstrateContext.Provider>
  )
}

// prop typechecking
SubstrateContextProvider.propTypes = {
  socket: PropTypes.string,
}

const useSubstrate = () => useContext(SubstrateContext)
const useSubstrateState = () => useContext(SubstrateContext).state

export { SubstrateContextProvider, useSubstrate, useSubstrateState }
