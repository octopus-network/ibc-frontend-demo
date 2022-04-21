import React, {useState, useEffect} from 'react'
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

import { SubstrateContextProvider, useSubstrateState, useSubstrate } from './substrate-lib'
import { DeveloperConsole } from './substrate-lib/components'

import AccountSelector from './AccountSelector'
import Balances from './Balances'
import BlockNumber from './BlockNumber'
import Events from './Events'
import Metadata from './Metadata'
import NodeInfo from './NodeInfo'
import Transfer from './Transfer'
import ReceiveAcc from './ReceiveAcc'
import config from './config'

function Main() {
  const stateSendInit = useSubstrateState()
  const stateRecvInit = useSubstrate().stateRecv
  const [stateSend, setStateSend] = useState(stateSendInit)
  const [stateRecv, setStateRecv] = useState(stateRecvInit)

  useEffect(() => {console.log('useEffect(() ')
    setStateSend(stateSendInit)
    setStateRecv(stateRecvInit)
  })

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

  if (stateSend.apiState === 'ERROR' || stateRecv.apiState === 'ERROR') return message(stateSend.apiError)
  else if (stateSend.apiState !== 'READY' || stateRecv.apiState !== 'READY') return loader('Connecting to Substrate')

  if (stateSend.keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const onChange = (_, data2) => {
    if(data2.placeholder === 'chain-send'){    console.log('1111111111111111', data2.value, stateSend, stateRecv)
        if (data2.value === stateSendInit.socket) { console.log('33333333333333333', "chain-send", data2.value)
          setStateSend(stateSendInit)
          setStateRecv(stateRecvInit)
        } else { console.log('55555555555555555555', "chain-send", data2.value)
          setStateSend(stateRecvInit)
          setStateRecv(stateSendInit)
        }
    } else {      console.log('44444444444444444', "chain-receive")
        if (data2.value === stateRecvInit.socket) {
          setStateSend(stateRecvInit)
          setStateRecv(stateSendInit)
        } else {
          setStateSend(stateSendInit)
          setStateRecv(stateRecvInit)
        }
    }
  }

  return (
    <div>
      <Sticky>
        <AccountSelector />
      </Sticky>
      <Container>
        <Grid stackable columns="equal">
          <Grid.Row stretched>
            <Metadata />
            <BlockNumber />
            <BlockNumber finalized />
          </Grid.Row>
          <Grid.Row stretched>
            <Balances />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Dropdown
                  placeholder='chain-send'
                  selection
                  options={config.chains}
                  onChange={onChange}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                  placeholder='chain-receive'
                  selection
                  options={config.chains}
                  onChange={onChange}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <NodeInfo api={stateSend.api} socket={stateSend.socket}/>
            <NodeInfo api={stateRecv.api} socket={stateRecv.socket}/>
          </Grid.Row>
          <Grid.Row>
            <Transfer api={stateSend.api}/>
            <ReceiveAcc api={stateRecv.api}/>
          </Grid.Row>
          <Grid.Row>
            <Events api={stateSend.api}/>
            <Events api={stateRecv.api}/>
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
