import React, {useState} from 'react'
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
  Dropdown
} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import { SubstrateContextProvider, useSubstrate } from './substrate-lib'
import { DeveloperConsole } from './substrate-lib/components'

import Events from './Events'
import NodeInfo from './NodeInfo'
import Transfer from './Transfer'
import ReceiveAcc from './ReceiveAcc'
import Trigger from './Trigger'
import config from './config'

/*
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsBroadcastTxSuccess, SigningStargateClient } from "@cosmjs/stargate";
*/

const SENDER = 'sender'
const RECEIVER = 'receiver'

function Main() {
  const state = useSubstrate()
  const stateSendInit = {state: state.state, setCurrentAccount: state.setCurrentAccount}
  const stateRecvInit = {state: state.stateRecv, setCurrentAccount: state.setCurrentAccountRecv}

  const [fromTo, setFromTo] = useState(true) // if the sender is stateSendInit, fromTo is true; visa versa
  const [transAmount, setTransAmount] = useState(0)
  const [tokenName, setTransTokenName] = useState('ATOM')
  const [addressFrom, setAddressFrom] = useState('')
  const [addressTo, setAddressTo] = useState('')

  const onTransTokenChange = (_tokenName) => {
    setTransTokenName(_tokenName)
  }

  const onAddressFromChange = (_address) => {
    setAddressFrom(_address)
  }

  const onAddressToChange = (_address) => {
    setAddressTo(_address)
  }

  const loader = text => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

  const message = errObj => (
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
  )

  const judgeFromTo = (_side, _fromTo) => {
    if (_side === SENDER)
      return _fromTo ? stateSendInit : stateRecvInit
    else if (_side === RECEIVER)
      return _fromTo ? stateRecvInit : stateSendInit
  }

  const setChain = (_side, _fromTo) => {
    if (_side === SENDER)
      return _fromTo ? config.chains[0].value : config.chains[1].value
    else if (_side === RECEIVER)
      return _fromTo ? config.chains[1].value : config.chains[0].value
  }

  if (stateSendInit.state.apiState === 'ERROR' || stateRecvInit.state.apiState === 'ERROR') return message(stateSendInit.apiError)
  else if (stateSendInit.state.apiState !== 'READY' || stateRecvInit.state.apiState !== 'READY') return loader('Connecting to Substrate')

  if (stateSendInit.state.keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const onChange = async (_, data2) => {
    if(data2.placeholder === 'chain-send')
      (data2.value === stateSendInit.state.socket) ? setFromTo(true) : setFromTo(false)
    else
      (data2.value === stateSendInit.state.socket) ? setFromTo(false) : setFromTo(true)
  }

  const onTransAmountChange = (_transAmount) => {
    setTransAmount(_transAmount)
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
          <Grid.Row>
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
          </Grid.Row>
          <Grid.Row>
            <NodeInfo api={ judgeFromTo(SENDER, fromTo).state.api } socket={ judgeFromTo(SENDER, fromTo).state.socket }/>
            <NodeInfo api={ judgeFromTo(RECEIVER, fromTo).state.api } socket={ judgeFromTo(RECEIVER, fromTo).state.socket }/>
          </Grid.Row>
          <Grid.Row>
            <Transfer
                state={ judgeFromTo(SENDER, fromTo) }
                setSenderAccount={ judgeFromTo(SENDER, fromTo).setCurrentAccount }
                onTransAmountChange={ onTransAmountChange }
                onTransTokenChange={ onTransTokenChange }
                onAddressFromChange={onAddressFromChange}
            />
            <ReceiveAcc
                state={ judgeFromTo(RECEIVER, fromTo) }
                setReceiverAccount={ judgeFromTo(RECEIVER, fromTo).setCurrentAccount }
                senderState={judgeFromTo(SENDER, fromTo)}
                transAmount={transAmount}
                tokenName={tokenName}
                onAddressToChange={onAddressToChange}
            />
          </Grid.Row>
          <Grid.Row>
            <Trigger
                state={ judgeFromTo(RECEIVER, fromTo) }
                senderState={judgeFromTo(SENDER, fromTo)}
                transAmount={transAmount}
                tokenName={tokenName}
                addressTo={addressTo}
                addressFrom={addressFrom}
            />
          </Grid.Row>
          <Grid.Row>
            <Events api={ judgeFromTo(SENDER, fromTo).state.api }/>
            <Events api={ judgeFromTo(RECEIVER, fromTo).state.api }/>
          </Grid.Row>
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
