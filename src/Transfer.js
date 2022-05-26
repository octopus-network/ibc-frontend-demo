import React, { useState, useEffect } from 'react'
import { Form, Input, Grid,
  Dropdown } from 'semantic-ui-react'
import config from './config'

function Main(props) {
  const [accountBalance, setAccountBalance] = useState(0)
  const [assets, setAssets] = useState([...config.assets])

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
  useEffect(async () => {
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

    updateAssets()
console.log("currentAccount", currentAccount)
    return () => unsubscribe && unsubscribe()
  }, [currentAccount, setCurrentAccount, keyring, initialAddress])

  const [formState, setFormState] = useState({ addressFrom: ''})
  const { addressFrom } = formState

  const [accSelected, setAccSelected] = useState(initialAddress)

  const updateAssets = () => {
    currentAccount &&
    Promise.all(assets.map(async (item, index)=>{
      const acc = await api.query.octopusAssets.account(item.id, acctAddr(currentAccount))
      return {...item, amount: acc.balance.toString()}
    })).then((_assets) => setAssets(_assets))
  }

  useEffect(() => {
    setCurrentAccount(keyring.getPair(accSelected))
    setSenderAccount(keyring.getPair(accSelected))
    // const id = setInterval(updateAssets, 3000)
    // return () => clearInterval(id)
  }, [socket])

  const onChange = (_, data) => {
    setCurrentAccount(keyring.getPair(data.value))
    setSenderAccount(keyring.getPair(data.value))
    setFormState(prev => ({ ...prev, [data.state]: data.value }))
    setAccSelected(data.value)
  }


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

  const [tokenName, setTokenName] = useState('ATOM')
  const onChangeTokenName = (_, data) => {
    setTokenName(data.value)
    props.onTransTokenChange(data.value)
  }

  return (
    <Grid.Column width={8}>
      <h1>Sender</h1>
      <Form>
        <Form.Field>
          {assets.map((item,index)=>{
              return <Input
                  fluid
                  label={item.name}
                  type="text"
                  key={index}
                  value={item.amount}
              />
            })
          }
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
              label="Native Asset(ATOM) Balance"
              type="text"
              placeholder="balance"
              value={accountBalance}
              state="accountBalance"
          />
        </Form.Field>

        <Form.Field>
          <Input
              fluid
              label="Token to Send"
              type="text"
              state="tokenName"
              value={tokenName}
              onChange={onChangeTokenName}
          />
        </Form.Field>

        <Form.Field>
          <Input
              fluid
              label="Amount"
              type="text"
              state="amount"
              value={amount}
              onChange={onChangeAmount}
          />
        </Form.Field>

      </Form>
    </Grid.Column>
  )
}

export default function Transfer(props) {
  const api = props.state.state.api
  return api && api.query && api.query.system && api.query.system.events ? (
      <Main {...props} />
  ) : null
}
