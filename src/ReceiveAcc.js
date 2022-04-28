import React, { useState, useEffect } from 'react'
import { Form, Input, Grid, Label, Icon, Dropdown } from 'semantic-ui-react'
import { TxButtonIbc, TxButton } from './substrate-lib/components'
import { useSubstrateState } from './substrate-lib'
import { keyring as Keyring } from '@polkadot/ui-keyring'
import { u8aToHex } from '@polkadot/util';

export default function Main(props) {
  const [currentAccount, setCurrentAccount] = useState(0)
  const [accountBalance, setAccountBalance] = useState(0)
  const api = props.state.state.api

  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({ addressTo: '' })

  const acctAddr = acct => (acct ? acct.address : '')
  useEffect(() => {
  currentAccount &&
  api.query.system
      .account(acctAddr(currentAccount), balance =>
          setAccountBalance(balance.data.free.toHuman())
      )
      // .then(unsub => (unsubscribe = unsub))
      .catch(console.error)
  }, [currentAccount, setCurrentAccount])

  const onChange = (_, data) => {
      setCurrentAccount(keyring.getPair(data.value))
      setFormState(prev => ({ ...prev, [data.state]: data.value }))
  }

  const { addressTo } = formState

  const { keyring } = useSubstrateState()
  const accounts = keyring.getPairs()

  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account.meta.name,
      text: account.meta.name,
      value: account.address,
    })
  })

  const ss58ToHex = (ss58) => {
      if (ss58) {
          const publicKey = Keyring.decodeAddress(ss58)
          const hexPublicKey = u8aToHex(publicKey)
          return hexPublicKey.substring(2)
      }
      return ''
  }

  const toHexStr = (myString) => '0x' + new Buffer(myString).toString('hex')

  return (
      <Grid.Column width={8}>
        <h1>Receiver</h1>
        <Form>
          <Form.Field>
            <Label basic color="teal">
              <Icon name="hand point right" />1 Unit = 1000000000000&nbsp;
            </Label>
            <Label
                basic
                color="teal"
                style={{ marginLeft: 0, marginTop: '.5em' }}
            >
              <Icon name="hand point right" />
              Transfer more than the existential amount for account with 0 balance
            </Label>
          </Form.Field>

          <Form.Field>
            <Dropdown
                placeholder="Select from available addresses"
                fluid
                selection
                search
                options={availableAccounts}
                state="addressTo"
                onChange={onChange}
            />
          </Form.Field>

          <Form.Field>
            <Input
                fluid
                label="Address"
                type="text"
                placeholder="address"
                value={addressTo}
                state="addressTo"
                onChange={onChange}
            />
          </Form.Field>
            <Form.Field>
                <Input
                    fluid
                    label="Balance"
                    type="text"
                    placeholder="balance"
                    value={accountBalance}
                    state="accountBalance"
                />
            </Form.Field>

          <Form.Field style={{ textAlign: 'center' }}>
            <TxButton
                label="Query Channel"
                type="QUERY"
                setStatus={setStatus}
                attrs={{
                  palletRpc: 'ibc',
                  callable: 'channels',
                  inputParams: [toHexStr('transfer'), toHexStr('channel-0')],
                  paramFields: [true, true],
                }}
            />
          </Form.Field>
          <Form.Field style={{ textAlign: 'center' }}>
            <TxButtonIbc
                label="Submit"
                type="SIGNED-TX"
                setStatus={setStatus}
                attrs={{
                  palletRpc: 'ibc',
                  callable: 'transfer',
                  inputParams: [toHexStr('transfer'), toHexStr('channel-0'), toHexStr('atom'), parseInt(props.transAmount),
                      toHexStr(ss58ToHex(addressTo)),
                      999999, Date.now() + 999999],
                  paramFields: [true, true, true, true, true, true, true],
                  state: props.state,
                  senderApi: props.senderApi,
                }}
            />
          </Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Form>
      </Grid.Column>
  )
}
