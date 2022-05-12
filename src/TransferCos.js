import React, { useState, useEffect } from 'react'
import { Form, Input, Grid, /*Label, Icon,*/ Dropdown } from 'semantic-ui-react'
import { TxButtonIbc, TxButton } from './substrate-lib/components'
// import { useSubstrateState } from './substrate-lib'
// import { keyring as Keyring } from '@polkadot/ui-keyring'
// import { u8aToHex } from '@polkadot/util';
import { toHexStr } from "./substrate-lib/utils";

export default function Main(props) {
  const [currentAccount, setCurrentAccount] = useState(0)
  const [accountBalance, setAccountBalance] = useState(0)
  const state = props.state
  const client = props.state.client
  const direction = props.direction
console.log(props)
  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({ addressTo: '' })

  // const acctAddr = acct => (acct ? acct.address : '')
  useEffect(() => {
    currentAccount &&
    client.getAllBalances(currentAccount).then(blc => {
      console.log(blc)
        setAccountBalance(blc[0].amount)
    }).catch(console.error)
  }, [currentAccount, setCurrentAccount])

  const onChange = (_, data) => {
      setCurrentAccount(data.value)
      setFormState(prev => ({ ...prev, [data.state]: data.value }))
  }

  const { addressTo } = formState

  const accounts = state.accountsCos

  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account.address,
      text: account.address,
      value: account.address,
    })
  })

    const [amount, setAmount] = useState(0)
    const onChangeAmount = (_, data) => {
        setAmount(data.value)
        props.onTransAmountChange(data.value)
    }
/*  const ss58ToHex = (ss58) => {
      if (ss58) {
          const publicKey = Keyring.decodeAddress(ss58)
          const hexPublicKey = u8aToHex(publicKey)
          return hexPublicKey.substring(2)
      }
      return ''
  }*/

  // const toHexStr = (myString) => '0x' + new Buffer(myString).toString('hex')

  return (
      <Grid.Column width={8}>
        <h1>{!direction ? 'Sender' : 'Receiver'}</h1>
        <Form>
          <Form.Field>
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

            {!direction && <Form.Field>
                <Input
                    fluid
                    label="Amount"
                    type="text"
                    state="amount"
                    value={amount}
                    onChange={onChangeAmount}
                />
            </Form.Field>}

        {direction &&
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
        }
        {direction &&
            <Form.Field style={{ textAlign: 'center' }}>
            <TxButtonIbc
                label="Submit"
                type="SIGNED-TX"
                setStatus={setStatus}
                attrs={{
                  palletRpc: 'ibc',
                  callable: 'transfer',
                  inputParams: [toHexStr('transfer'), toHexStr('channel-0'), toHexStr('atom'), props.transAmount,
                      /*toHexStr(ss58ToHex(addressTo))*/toHexStr(addressTo),
                      999999, Date.now() + 999999],
                  paramFields: [true, true, true, true, true, true, true],
                  state: props.stateSub,
                  senderApi: props.senderApi,
                }}
            />
          </Form.Field>}
          {direction && <div style={{ overflowWrap: 'break-word' }}>{status}</div>}
        </Form>
      </Grid.Column>
  )
}
