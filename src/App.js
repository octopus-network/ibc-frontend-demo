import React from 'react'
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
  const { api, apiState, apiError, keyringState, socket } = useSubstrateState()
  const stateRecv = useSubstrate().stateRecv

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

  if (apiState === 'ERROR' || stateRecv.apiState === 'ERROR') return message(apiError)
  else if (apiState !== 'READY' || stateRecv.apiState !== 'READY') return loader('Connecting to Substrate')

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const onChange = (data1, data2) => {
    // console.log('2222222222222222222', data1, data2)
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
                  placeholder='chain'
                  selection
                  options={config.chains}
                  onChange={onChange}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                  placeholder='chain'
                  selection
                  options={config.chains}
                  onChange={onChange}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <NodeInfo api={api} socket={socket}/>
            <NodeInfo api={stateRecv.api} socket={stateRecv.socket}/>
          </Grid.Row>
          <Grid.Row>
            <Transfer api={api}/>
            <ReceiveAcc api={stateRecv.api}/>
          </Grid.Row>
          <Grid.Row>
            <Events api={api}/>
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
