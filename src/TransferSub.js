import React, { useState, useEffect } from 'react'
import { Form, Input, Grid, Dropdown } from 'semantic-ui-react'
import {TxButton, TxButtonCos} from "./substrate-lib/components";
import { toHexStr } from "./substrate-lib/utils";

function Main(props) {
  const [accountBalance, setAccountBalance] = useState(0)
  const direction = props.direction

  const {
    setCurrentAccount,
    state: { keyring, currentAccount, api, socket },
  } = props.state

  const setSenderAccount = props.setSenderAccount

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map(account => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: 'user',
  }))

  const initialAddress =
      keyringOptions.length > 0 ? keyringOptions[0].value : ''
  const acctAddr = acct => (acct ? acct.address : '')

  // Set the initial address
  useEffect(() => {
    // `setCurrentAccount()` is called only when currentAccount is null (uninitialized)
    !currentAccount &&
    initialAddress.length > 0 &&
    setCurrentAccount(keyring.getPair(initialAddress))

    !currentAccount &&
    initialAddress.length > 0 &&
    setSenderAccount(keyring.getPair(initialAddress))

    let unsubscribe
    currentAccount &&
    api.query.system
        .account(acctAddr(currentAccount), balance =>
            setAccountBalance(balance.data.free.toHuman())
        )
        .then(unsub => (unsubscribe = unsub))
        .catch(console.error)

    return () => unsubscribe && unsubscribe()
  }, [currentAccount, setCurrentAccount, keyring, initialAddress])

  const [formState, setFormState] = useState({ addressFrom: ''})
  const { addressFrom } = formState

  const [accSelected, setAccSelected] = useState(initialAddress)
  useEffect(() => {
    setCurrentAccount(keyring.getPair(accSelected))
    setSenderAccount(keyring.getPair(accSelected))
  }, [socket])

  const onChange = (_, data) => {
    setCurrentAccount(keyring.getPair(data.value))
    setSenderAccount(keyring.getPair(data.value))
    setFormState(prev => ({ ...prev, [data.state]: data.value }))
    setAccSelected(data.value)
  }

  const [status, setStatus] = useState(null)
  const accounts = keyring.getPairs()

  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account.meta.name,
      text: account.meta.name,
      value: account.address,
    })
  })

  const [amount, setAmount] = useState(0)
  const onChangeAmount = (_, data) => {
    setAmount(data.value)
    props.onTransAmountChange(data.value)
  }

  return (
    <Grid.Column width={8}>
      <h1>{direction ? 'Sender' : 'Receiver'}</h1>
      <Form>
        <Form.Field>
          <Dropdown
            placeholder="Select from available addresses"
            fluid
            selection
            search
            options={availableAccounts}
            state="addressFrom"
            onChange={onChange}
            value={accSelected}
          />
        </Form.Field>

        <Form.Field>
          <Input
            fluid
            label="Address"
            type="text"
            placeholder="address"
            value={addressFrom}
            state="addressFrom"
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

        {direction && <Form.Field>
          <Input
              fluid
              label="Amount"
              type="text"
              state="amount"
              value={amount}
              onChange={onChangeAmount}
          />
        </Form.Field>}

        {!direction &&
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
        {!direction &&
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButtonCos
              label="Submit"
              type="SIGNED-TX"
              setStatus={setStatus}
              attrs={{
                inputParams: [/*toHexStr(ss58ToHex(addressTo))*/"cosmos1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5",  {
                  denom: "atom",
                  amount: props.transAmount,
                },
                  'transfer', 'channel-0'],
                paramFields: [true, true, true, true],
                stateCos: props.stateCos,
              }}
          />
        </Form.Field>
        }

        {!direction && <div style={{ overflowWrap: 'break-word' }}>{status}</div>}
      </Form>
    </Grid.Column>
  )
}

export default function TransferSub(props) {
  const api = props.state.state.api
  return api && api.query && api.query.system && api.query.system.events ? (
      <Main {...props} />
  ) : null
}
