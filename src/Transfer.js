import React, { useState, useEffect } from 'react'
import { Form, Input, Grid, Label, Icon, Dropdown } from 'semantic-ui-react'
import {useSubstrate} from './substrate-lib'

export default function Main(props) {
  const [accountBalance, setAccountBalance] = useState(0)

  const api = props.api
  const {
    setCurrentAccount,
    state: { keyring, currentAccount },
  } = useSubstrate()

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

    currentAccount &&
    api.query.system
        .account(acctAddr(currentAccount), balance =>
            setAccountBalance(balance.data.free.toHuman())
        )
        // .then(unsub => (unsubscribe = unsub))
        .catch(console.error)

  }, [currentAccount, setCurrentAccount, keyring, initialAddress])

  const [formState, setFormState] = useState({ addressFrom: '', amount: 0 })

  const onChange = (_, data) => {
    setCurrentAccount(keyring.getPair(data.value))
    setFormState(prev => ({ ...prev, [data.state]: data.value }))
  }

  const { addressFrom } = formState

  const accounts = keyring.getPairs()

  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account.meta.name,
      text: account.meta.name,
      value: account.address,
    })
  })

  return (
    <Grid.Column width={8}>
      <h1>Transfer</h1>
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
            state="addressFrom"
            onChange={onChange}
          />
        </Form.Field>

        <Form.Field>
          <Input
            fluid
            label="From"
            type="text"
            placeholder="address"
            value={addressFrom}
            state="addressFrom"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
              fluid
              label="Balance"
              type="text"
              placeholder="address"
              value={accountBalance}
              state="accountBalance"
              onChange={onChange}
          />
        </Form.Field>
      </Form>
    </Grid.Column>
  )
}
