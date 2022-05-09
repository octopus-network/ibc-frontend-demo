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
import config from './config'

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { assertIsBroadcastTxSuccess, SigningStargateClient } from "@cosmjs/stargate";

const SENDER = 'sender'
const RECEIVER = 'receiver'

function Main() {
  const state = useSubstrate()
  const stateSendInit = {state: state.state, setCurrentAccount: state.setCurrentAccount}
  const stateRecvInit = {state: state.stateRecv, setCurrentAccount: state.setCurrentAccountRecv}

  const [fromTo, setFromTo] = useState(true) // if the sender is stateSendInit, fromTo is true; visa versa
  const [transAmount, setTransAmount] = useState(0)

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

    const mnemonic = "picture switch picture soap flip dawn nerve easy rebuild company hawk stand menu rhythm unfold engine rug rally weapon raccoon glide mosquito lion dog";
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
    const [firstAccount] = await wallet.getAccounts();console.log("firstAccount", firstAccount)

    const rpcEndpoint = "http://127.0.0.1:26657";
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);

    const recipient = "cosmos1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5";
    const amount = {
      denom: "atom",
      amount: "8000",
    };

    const fee = {
      amount: [
        {
          denom: "atom",
          amount: "2",
        },
      ],
      gas: "180000", // 180k
    };
    // const result = await client.getAllBalances('cosmos1xh2jvz9ecty8qdctlgscmys2dr5gz729k0l7x4', "atom");console.log(result)
    // const result = await client.sendTokens(firstAccount.address, recipient, [amount], fee); console.log("result", result)
    const result = await client.sendIbcTokens(
        firstAccount.address, recipient, amount,
        'transfer', 'channel-0',
        undefined, undefined, fee, ''); console.log("result", result)
    assertIsBroadcastTxSuccess(result);
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
                setSenderAccount={ judgeFromTo(RECEIVER, fromTo).setCurrentAccount }
                onTransAmountChange={ onTransAmountChange }
             />
            <ReceiveAcc
                state={ judgeFromTo(RECEIVER, fromTo) }
                senderApi={judgeFromTo(SENDER, fromTo).state.api}
                transAmount={transAmount}
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
