import React, {useState, useEffect} from 'react'
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  // Message,
  Dropdown
} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import { SubstrateContextProvider, useSubstrate } from './substrate-lib'
import { DeveloperConsole } from './substrate-lib/components'

// import Events from './Events'
import NodeInfo from './NodeInfo'
import NodeInfoCos from './NodeInfoCos'
import TransferSub from './TransferSub'
import TransferCos from './TransferCos'
import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import {SigningStargateClient} from "@cosmjs/stargate";
import config from './config'

/*
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsBroadcastTxSuccess, SigningStargateClient } from "@cosmjs/stargate";
*/

const SENDER = 'sender'
const RECEIVER = 'receiver'

function Main() {
  const state = useSubstrate()
  const stateSubInit = {state: state.state, setCurrentAccount: state.setCurrentAccount}

    const [stateCosInit, setStateCosInit] = useState()

    useEffect(async () => {
        const mnemonic = "picture switch picture soap flip dawn nerve easy rebuild company hawk stand menu rhythm unfold engine rug rally weapon raccoon glide mosquito lion dog";
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
        const accountsCos = await wallet.getAccounts();
        const rpcEndpoint = config.PROVIDER_SOCKET_RECV
        const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
        setStateCosInit({accountsCos, client, rpcEndpoint});
    }, [])

  const [fromTo, setFromTo] = useState(true) // if the sender is Substrate Chain, fromTo is true; if the sender is Cosmos Chain, fromTo is true
  const [transAmount, setTransAmount] = useState(0)
  const [tokenName, setTransTokenName] = useState('atom')

  const loader = text => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

/*  const message = errObj => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  )*/

  const judgeFromTo = (_side, _fromTo) => {
    if (_side === SENDER)
      return _fromTo ? stateSubInit : stateCosInit
    else if (_side === RECEIVER)
      return _fromTo ? stateCosInit : stateSubInit
  }

  const setChain = (_side, _fromTo) => {
    if (_side === SENDER)
      return _fromTo ? config.chains[0].value : config.chains[1].value
    else if (_side === RECEIVER)
      return _fromTo ? config.chains[1].value : config.chains[0].value
  }

  if (stateSubInit.state.apiState === 'ERROR' || !stateCosInit ) return 'not ready' /*message(stateSubInit.apiError)*/
  else if (stateSubInit.state.apiState !== 'READY' ) return loader('Connecting to Substrate')

  if (stateSubInit.state.keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const onChange = async (_, data2) => {
    if(data2.placeholder === 'chain-send')
      (data2.value === stateSubInit.state.socket) ? setFromTo(true) : setFromTo(false)
    else
      (data2.value === stateSubInit.state.socket) ? setFromTo(false) : setFromTo(true)
  }

  const onTransAmountChange = (_transAmount) => {
    setTransAmount(_transAmount)
  }

    const onTransTokenChange = (_tokenName) => {
        setTransTokenName(_tokenName)
    }

  return (
    <div>
      <Sticky
        style={{
          backgroundColor: '#fff',
          borderColor: '#fff',
          paddingTop: '1em',
          paddingBottom: '1em',
        }}
      >
      </Sticky>
      <Container>
        <Grid stackable columns="equal">
          {<Grid.Row>
            <Grid.Column>
              <Dropdown
                  placeholder='chain-send'
                  selection
                  options={config.chains}
                  onChange={onChange}
                  value={setChain(SENDER, fromTo)}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                  placeholder='chain-receive'
                  selection
                  options={config.chains}
                  onChange={onChange}
                  value={setChain(RECEIVER, fromTo)}
              />
            </Grid.Column>
          </Grid.Row>}
          <Grid.Row>
            {fromTo && <NodeInfo api={ judgeFromTo(SENDER, fromTo).state.api } socket={ judgeFromTo(SENDER, fromTo).state.socket }/>}
            {fromTo && <NodeInfoCos state={ stateCosInit } />}
            {!fromTo && <NodeInfoCos state={ stateCosInit } />}
            {!fromTo && <NodeInfo api={ stateSubInit.state.api } socket={ stateSubInit.state.socket }/>}
          </Grid.Row>

          <Grid.Row>
            {fromTo && <TransferSub
                direction={fromTo}
                state={ stateSubInit }
                stateCos={ stateCosInit }
                setSenderAccount={ stateSubInit.setCurrentAccount }
                onTransAmountChange={ onTransAmountChange }
                onTransTokenChange={ onTransTokenChange }
                transAmount={transAmount}
                tokenName={tokenName}
             />}
            {fromTo && <TransferCos
                direction={fromTo}
                state={ stateCosInit }
                stateSub={ stateSubInit }
                senderApi={stateSubInit.state.api}
                onTransAmountChange={ onTransAmountChange }
                onTransTokenChange={ onTransTokenChange }
                transAmount={transAmount}
                tokenName={tokenName}
            />}
              {!fromTo && <TransferCos
                  direction={fromTo}
                  state={ stateCosInit }
                  stateSub={ stateSubInit }
                  senderApi={stateSubInit.state.api}
                  onTransAmountChange={ onTransAmountChange }
                  onTransTokenChange={ onTransTokenChange }
                  transAmount={transAmount}
                  tokenName={tokenName}
              />}
              {!fromTo && <TransferSub
                  direction={fromTo}
                  state={ stateSubInit }
                  stateCos={ stateCosInit }
                  setSenderAccount={ stateSubInit.setCurrentAccount }
                  onTransAmountChange={ onTransAmountChange }
                  onTransTokenChange={ onTransTokenChange }
                  transAmount={transAmount}
                  tokenName={tokenName}
              />}
          </Grid.Row>
{/*          <Grid.Row>
            <Events api={ judgeFromTo(SENDER, fromTo).state.api }/>
            <Events api={ judgeFromTo(RECEIVER, fromTo).state.api }/>
          </Grid.Row>*/}
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  )
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  )
}
